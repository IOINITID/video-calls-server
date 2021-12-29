export class UserDto {
  id: string;
  email: string;
  isActivated: boolean;
  status: string;
  socketId: string;

  constructor(model: any) {
    this.id = model._id;
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.status = model.status;
    this.socketId = model.socketId;
  }
}
