import { defineComponent, h } from 'vue';
import { FileTextOutlined, AppstoreOutlined, BarsOutlined, IdcardOutlined, CommentOutlined, FolderOutlined, BookOutlined, SlidersOutlined, EditOutlined, SearchOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons-vue';
const icons = { file: FileTextOutlined, board: AppstoreOutlined, waves: BarsOutlined, seed: IdcardOutlined, story: CommentOutlined, assets: FolderOutlined, book: BookOutlined, properties: SlidersOutlined, editor: EditOutlined, search: SearchOutlined, focus: ExpandOutlined, unfocus: CompressOutlined };
export default defineComponent({
  props: { name: { type: String, required: true } },
  setup: (props) => () => h(icons[props.name as keyof typeof icons] || FileTextOutlined, { 'aria-hidden': 'true' })
});
