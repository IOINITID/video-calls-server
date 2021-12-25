export class UserDto {
  id: string;
  email: string;
  isActivated: boolean;

  constructor(model: any) {
    this.id = model._id;
    this.email = model.email;
    this.isActivated = model.isActivated;
  }
}
