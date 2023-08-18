import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/threads.actions";
import { currentUser } from "@clerk/nextjs";
async function Home() {
  const loadedPosts = await fetchThreads(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {loadedPosts.posts?.length === 0 ? (
          <p className="no-result">No threads found.</p>
        ) : (
          <>
            {loadedPosts.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}

export default Home;
