export interface Province {
  id: number;
  name: string;
}

export interface Canton {
  id: number;
  name: string;
  provinceId: number;
  province?: Province;
}

export interface District {
  id: number;
  name: string;
  cantonId: number;
  canton?: Canton;
}
