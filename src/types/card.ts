export interface CardData {
  id?: string;
  type: 'wedding' | 'birthday' | 'custom';
  title: string;
  fields: { [key: string]: any };
  backgroundImage?: string;
  createdAt?: Date;
  userId?: string;
}