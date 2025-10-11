export interface GameCategory {
  id: number;
  name: string;
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
