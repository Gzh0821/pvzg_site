interface Element {
  [key: string]: number | string;
}
export interface KeyMap {
  [key: string]: { zh: string, en: string, icon?: string };
}
export interface Zombie {
  elements?: Element;
  id?: number;
  name: string;
  enName: string;
  enFamily?: string;
  image: string;
  description?: string;
  chat?: String;
  zombieType: string;
  codename: string
  frameWorld: string;
  special?: [Element] | [];
}