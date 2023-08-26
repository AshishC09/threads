import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let threadsLoaded: any;

  if (accountType === "User") {
    threadsLoaded = await fetchUserPosts(accountId);
  } else {
    threadsLoaded = await fetchCommunityPosts(accountId);
  }

  if (!threadsLoaded) return redirect("/");
  return (
    <section className="mt-9 flex flex-col gap-10">
      {threadsLoaded?.threads?.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? {
                  name: threadsLoaded.name,
                  image: threadsLoaded.image,
                  id: threadsLoaded.id,
                }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={threadsLoaded}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
