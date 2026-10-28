import { defineComponent, h, type PropType } from 'vue';
import { Select } from 'ant-design-vue';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getAirMemberOrder, getSpecialTypeOptions, SPECIAL_SHIP_DEFAULTS } from './special-mode-codec.mjs';

export default defineComponent({
  name: 'SpecialModePanel',
  props: {
    bindings: { type: Array as PropType<any[]>, required: true },
    objects: { type: Array as PropType<any[]>, required: true },
    options: { type: Object as PropType<any>, required: true },
    state: { type: Object as PropType<any>, required: true },
    plantOptions: { type: Array as PropType<any[]>, required: true },
    zombieOptions: { type: Array as PropType<any[]>, required: true },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['localize', 'remove'],
  setup(props, { emit }) {
    const t = (key: string, params?: Record<string, unknown>) => props.translate(key, params);
    const field = (label: string, node: any) => h('label', { class: 'field-row' }, [h('span', label), node]);
    const number = (label: string, value: any, update: (value: string) => void, attrs: any = {}) => field(label, h('input', {
      type: 'number', value: value ?? '', 'aria-label': label, ...attrs,
      onChange: (event: Event) => update((event.target as HTMLInputElement).value)
    }));
    const action = (label: string, icon: any, run: () => void, disabled = false) => h('button', {
      type: 'button', class: 'special-icon-button', 'aria-label': label, title: label, onClick: run, disabled
    }, h(icon));
    const select = (label: string, value: any, items: any[], change: (value: string) => void) => field(label, h('select', {
      value, 'aria-label': label, onChange: (event: Event) => change((event.target as HTMLSelectElement).value)
    }, items.map(item => h('option', { value: item.value }, item.label))));
    const typeOptions = (kind: string, value: string) => {
      const all = getSpecialTypeOptions(props.objects, kind === 'boss' ? props.options.bossTypes : props.options.plantTypes, kind);
      const assets = kind === 'boss' ? props.zombieOptions : props.plantOptions;
      const choices = all.map((item: any) => {
        const asset = assets.find(asset => asset.code === item.base);
        return { value: item.value, label: asset ? `${asset.name}${item.value === item.base ? '' : ` · ${item.value}`}` : item.value };
      });
      return choices.some((item: any) => item.value === value) || !value ? choices : [{ value, label: value }, ...choices];
    };
    const typeSelect = (label: string, value: string, kind: string, change: (value: string) => void) => field(label, h(Select, {
      value, options: typeOptions(kind, value), showSearch: true, 'aria-label': label, popupClassName: 'level-editor-select-popup',
      filterOption: (input: string, option: any) => `${option.label} ${option.value}`.toLowerCase().includes(input.toLowerCase()),
      onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape' && (event.target as HTMLElement).getAttribute('aria-expanded') === 'true') event.stopPropagation(); },
      onChange: (value: any) => change(String(value))
    }));
    const namedTeam = (team: any, index: number) => (typeof team?.Name === 'string' ? team.Name : '') || team?.Name?.[props.state.nameLanguage] || team?.Name?.en || team?.Name?.zh || t('specialTeamNumber', { count: index + 1 });
    const boss = (data: any) => h('div', { class: 'special-field-grid' }, [
      typeSelect(t('specialField_ZombossMechType'), data.ZombossMechType, 'boss', value => { data.ZombossMechType = value; }),
      number(t('specialField_ReservedColumnCount'), data.ReservedColumnCount ?? 0, value => {
        if (value === '') delete data.ReservedColumnCount; else data.ReservedColumnCount = Number(value);
      }, { min: 0, max: 9, step: 1 }),
      ...[['mY', 'row', 5], ['mX', 'column', 9]].map(([key, label, max]) => number(t(`specialBoss_${label}`),
        data.ZombossSpawnGridPosition?.[key] == null ? '' : Number(data.ZombossSpawnGridPosition[key]) + 1, value => {
          data.ZombossSpawnGridPosition ||= {};
          if (value === '') delete data.ZombossSpawnGridPosition[key]; else data.ZombossSpawnGridPosition[key] = Number(value) - 1;
        }, { min: 1, max, step: 1 })),
      select(t('specialBossMusic'), data.DiscardBossMusic ? 'keep' : data.UseKongfuBossMusic ? 'kongfu' : 'boss',
        ['boss', 'kongfu', 'keep'].map(value => ({ value, label: t(`specialBossMusic_${value}`) })), value => {
          data.DiscardBossMusic = value === 'keep'; data.UseKongfuBossMusic = value === 'kongfu';
        })
    ]);
    const ship = (data: any) => h('div', { class: 'special-field-grid' }, [
      ...['Toughness', 'ToughnessShield', 'BloverSPS', 'BloverDPS', 'EdgeX'].map(key => number(t(`specialField_${key}`),
        key === 'EdgeX' ? Number(data[key] ?? SPECIAL_SHIP_DEFAULTS[key]) + 1 : data[key] ?? SPECIAL_SHIP_DEFAULTS[key], value => {
          if (value === '') delete data[key]; else data[key] = Number(value) - (key === 'EdgeX' ? 1 : 0);
        }, { min: key === 'EdgeX' ? 1.01 : 0.01, step: key === 'EdgeX' ? .5 : 'any' })),
      select(t('specialShipShield'), data.ForceShielded ? 'on' : data.ForceUnshielded ? 'off' : 'game',
        ['game', 'on', 'off'].map(value => ({ value, label: t(`specialShipShield_${value}`) })), value => {
          data.ForceShielded = value === 'on'; data.ForceUnshielded = value === 'off';
        })
    ]);
    const airRaid = (data: any) => {
      const teams = Array.isArray(data.Teams) ? data.Teams : [];
      const index = Math.max(0, Math.min(props.state.teamIndex, teams.length - 1)), team = teams[index];
      const members = Array.isArray(team?.Members) ? team.Members : [];
      const baseType = getSpecialTypeOptions(props.objects, props.options.plantTypes, 'plant')[0]?.value || 'peashooter';
      return h('div', { class: 'special-air-editor' }, [
        number(t('specialField_TargetPoint'), data.TargetPoint, value => { if (value === '') delete data.TargetPoint; else data.TargetPoint = Number(value); }, { min: 0, step: 1 }),
        h('div', { class: 'special-team-switcher', 'aria-label': t('specialTeams') }, [
          ...teams.map((team: any, i: number) => h('button', { type: 'button', 'aria-pressed': index === i,
            onClick: () => { props.state.teamIndex = i; } }, namedTeam(team, i))),
          h('button', { type: 'button', 'aria-label': t('specialAddTeam'), disabled: teams.length >= 3, onClick: () => {
            data.Teams = [...teams, { Name: { [props.state.nameLanguage]: t('specialTeamNumber', { count: teams.length + 1 }) }, Difficulty: 3, Members: [{ Type: baseType }] }];
            props.state.teamIndex = teams.length;
          } }, [h(PlusOutlined), t('specialAddTeam')])
        ]),
        team && typeof team === 'object' && !Array.isArray(team) ? h('div', { class: 'special-team-editor' }, [
          h('div', { class: 'special-team-toolbar' }, [
            h('h3', namedTeam(team, index)),
            h('div', [action(t('specialTeamEarlier'), ArrowUpOutlined, () => {
              [teams[index - 1], teams[index]] = [teams[index], teams[index - 1]]; props.state.teamIndex = index - 1;
            }, index === 0), action(t('specialTeamLater'), ArrowDownOutlined, () => {
              [teams[index + 1], teams[index]] = [teams[index], teams[index + 1]]; props.state.teamIndex = index + 1;
            }, index === teams.length - 1), action(t('specialRemoveTeam'), DeleteOutlined, () => {
              teams.splice(index, 1); props.state.teamIndex = Math.max(0, index - 1);
            }, teams.length <= 1)])
          ]),
          h('div', { class: 'special-field-grid' }, [
            select(t('nameLanguage'), props.state.nameLanguage, ['zh', 'en', 'es', 'ru'].map(value => ({ value, label: value.toUpperCase() })), value => { props.state.nameLanguage = value; }),
            field(t('specialTeamName'), h('input', { value: typeof team.Name === 'string' ? team.Name : typeof team.Name?.[props.state.nameLanguage] === 'string' ? team.Name[props.state.nameLanguage] : '',
              'aria-label': t('specialTeamName'), onChange: (event: Event) => { if (!team.Name || typeof team.Name !== 'object' || Array.isArray(team.Name)) team.Name = {}; team.Name[props.state.nameLanguage] = (event.target as HTMLInputElement).value; } })),
            number(t('specialTeamDifficulty'), team.Difficulty, value => { if (value === '') delete team.Difficulty; else team.Difficulty = Number(value); }, { min: 0, max: 5, step: 1 })
          ]),
          h('h3', t('specialAirStages')),
          h('div', { class: 'special-air-heading', 'aria-hidden': 'true' }, [h('span', t('specialAirPlant')), h('span', t('specialAirUpgrade'))]),
          h('div', { class: 'special-air-members' }, getAirMemberOrder(members).map(({ member, index }: any) => member && typeof member === 'object' ? h('div', { class: 'special-air-member', key: index }, [
            typeSelect(t('specialAirPlant'), member.Type, 'plant', value => { member.Type = value; }),
            number(t('specialAirUpgrade'), member.FullPoint, value => { if (value === '') delete member.FullPoint; else member.FullPoint = Number(value); }, { min: 0, step: 1, placeholder: '0' }),
            action(t('remove'), DeleteOutlined, () => members.splice(index, 1), members.length <= 1)
          ]) : h('p', t('specialInvalidConfig')))),
          h('button', { type: 'button', class: 'text-button special-add-stage', 'aria-label': t('specialAddStage'), onClick: () => {
            const maximum = Math.max(0, ...members.map((member: any) => Number(member?.FullPoint) || 0));
            team.Members = [...members, { Type: baseType, FullPoint: maximum + 5000 }];
          } }, [h(PlusOutlined), t('specialAddStage')])
        ]) : teams.length ? h('p', t('specialInvalidConfig')) : null
      ]);
    };
    return () => {
      const bindings = props.bindings.filter(binding => binding.kind === props.state.kind);
      const binding = bindings.find(binding => binding.reference === props.state.reference) || bindings[0];
      if (!binding) return null;
      const data = binding.object.objdata;
      return h('div', { class: 'special-mode-panel' }, [
        bindings.length > 1 ? select(t('specialModule'), binding.reference, bindings.map(binding => ({ value: binding.reference, label: binding.object.aliases?.join(', ') || binding.reference })), value => {
          props.state.reference = value; props.state.teamIndex = 0;
        }) : null,
        binding.shared ? h('div', { class: 'special-shared-source' }, [h('p', t('specialSharedConfig')),
          h('button', { type: 'button', class: 'add-button', onClick: () => emit('localize', binding) }, t('specialLocalize'))]) : null,
        h('fieldset', { disabled: binding.shared, class: 'special-mode-fields' }, [
          !data || typeof data !== 'object' || Array.isArray(data) ? h('p', t('specialInvalidConfig')) : binding.kind === 'boss' ? boss(data) : binding.kind === 'airRaid' ? airRaid(data) : ship(data)
        ]),
        h('button', { type: 'button', class: 'text-button danger special-remove-mode', 'aria-label': t('specialRemoveMode'), onClick: () => emit('remove', binding) }, [h(DeleteOutlined), t('specialRemoveMode')])
      ]);
    };
  }
});
