export interface GameCategory {
  id: number;
  name: string;
}

export interface GameCategoryOption extends GameCategory {
  value: string | number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  releaseDate: Date;
  categories: GameCategory[];
  imageUrl?: string;
}
