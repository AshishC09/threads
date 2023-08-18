import { fetchThreads } from "@/lib/actions/threads.actions";

export async function Home() {
  const loadedPosts = await fetchThreads(1, 30);
  console.log(loadedPosts);

  return (
    <>
      <h1>Home</h1>
    </>
  );
}
