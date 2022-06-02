import { User } from "../models/User";
import { ApolloError } from "apollo-server";
import { BaseModel } from "../models/BaseModel";

export class CRUD<Model extends typeof BaseModel> {
  private _classType: Model;

  constructor(classType: Model) {
    this._classType = classType;
  }

  async delete(id: string) {
    await this._classType.delete(id);

    return;
  }

  async update(model: InstanceType<Model>) {
    if (model.id) {
      delete model.id;
    }
    await model.save();
    return model as InstanceType<Model>;
  }

  async create(model: InstanceType<Model>) {
    try {
      delete model.id;
      const item = await model.save();
      return item as InstanceType<Model>;
    } catch (err) {
      return err;
    }
  }

  // async read<Type extends LgBaseEntity>(ctx: IContext<Type[]>) {
  //   const req = await Utils.buildQuery(this.classType, ctx);
  //   const items = await req.getMany();
  //   return items as InstanceType<Model>[];
  // }

  // async readOne<Type extends LgBaseEntity>(ctx: IContext<Type>) {
  //   const req = await Utils.buildQuery(this.classType, ctx);
  //   const items = await req.getOne();
  //   return items as InstanceType<Model>;
  // }
}
