"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface createThreadParams {
  text: string;
  author: string;
  community: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  community,
  path,
}: createThreadParams) {
  try {
    await connectToDB();

    const newThread = await Thread.create({ text, author, community });
    await User.findByIdAndUpdate(author, { $push: { threads: newThread._id } });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetching posts that have no parents (top-level threads)
    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postsQuery?.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Error in fetching threads: ${error?.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  try {
    await connectToDB();
    const threadQuery = Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      });

    const thread = await threadQuery?.exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Error in fetching thread: ${error?.message}`);
  }
}
