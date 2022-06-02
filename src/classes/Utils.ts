import { ApolloError } from "apollo-server";
import { Tag } from "../models/Tag";

export const checkAccessData = (userId, dataId) => {
  if (userId != dataId)
    throw new ApolloError("Unauthorized", "token:not(received)");
};

// check if tags exist otherwise, create it;
export const TagCheck = async (tag: any[]) => {
  let realTag: Tag[] = [];
  await Promise.all(
    tag.map(async (item) => {
      const exist = await Tag.findOne({
        where: {
          hashtag: item.hashtag,
        },
      });
      if (exist) realTag = [...realTag, exist];
      else {
        const newTag = await Tag.save({ ...item });
        realTag = [...realTag, newTag];
      }
    }),
  );
  return realTag;
};
