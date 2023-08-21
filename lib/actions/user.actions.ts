"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface UpdateUserArgs {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}
export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: UpdateUserArgs): Promise<void> {
  try {
    await connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user ${error}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    return await User.findOne({ id: userId });
    // .populate({
    //   path: "community",
    // model: "Community",});
  } catch (error: any) {
    throw new Error(`Failed to fetch user ${error}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectToDB();
    // TODO: populate community
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      },
    });
    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts ${error?.message}`);
  }
}

export const fetchUsers = async ({
  userId,
  pageSize = 20,
  pageNumber = 1,
  sortBy = "desc",
  searchString = "",
}: {
  userId: string;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortOrder;
  searchString?: string;
}) => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };
    const userQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const usersCount = await User.countDocuments(query);

    const users = await userQuery.exec();
    const isNext = usersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users ${error?.message}`);
  }
};
