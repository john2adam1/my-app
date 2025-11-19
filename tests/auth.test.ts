/**
 * Basic authentication tests
 * Run with: npx ts-node tests/auth.test.ts
 * Or configure Jest/other test runner
 */

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

interface TestUser {
  name: string;
  username: string;
  email: string;
  password: string;
}

const testUser: TestUser = {
  name: "Test User",
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: "testpassword123",
};

let cookies = "";

async function fetchWithCookies(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (cookies) {
    headers.set("Cookie", cookies);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Extract cookies from response
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookies = setCookie;
  }

  return response;
}

async function testRegister() {
  console.log("Testing register...");
  const res = await fetchWithCookies(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser),
  });

  const data = await res.json();
  if (res.ok) {
    console.log("✅ Register successful");
    return true;
  } else {
    console.error("❌ Register failed:", data);
    return false;
  }
}

async function testLogin() {
  console.log("Testing login...");
  const res = await fetchWithCookies(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrUsername: testUser.email,
      password: testUser.password,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log("✅ Login successful");
    return true;
  } else {
    console.error("❌ Login failed:", data);
    return false;
  }
}

async function testMe() {
  console.log("Testing /api/auth/me...");
  const res = await fetchWithCookies(`${API_BASE}/api/auth/me`);

  const data = await res.json();
  if (res.ok && data.user) {
    console.log("✅ Get current user successful");
    console.log("   User:", data.user.username);
    return true;
  } else {
    console.error("❌ Get current user failed:", data);
    return false;
  }
}

async function testCreatePost() {
  console.log("Testing create post...");
  const res = await fetchWithCookies(`${API_BASE}/api/posts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Test post from automated test",
    }),
  });

  const data = await res.json();
  if (res.ok && data.post) {
    console.log("✅ Create post successful");
    console.log("   Post ID:", data.post._id);
    return data.post._id;
  } else {
    console.error("❌ Create post failed:", data);
    return null;
  }
}

async function testLikePost(postId: string) {
  console.log("Testing like post...");
  const res = await fetchWithCookies(`${API_BASE}/api/posts/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  });

  const data = await res.json();
  if (res.ok && data.liked !== undefined) {
    console.log("✅ Like post successful");
    console.log("   Liked:", data.liked, "Likes count:", data.likesCount);
    return true;
  } else {
    console.error("❌ Like post failed:", data);
    return false;
  }
}

async function runTests() {
  console.log("Starting authentication tests...\n");

  const results = {
    register: await testRegister(),
    login: await testLogin(),
    me: await testMe(),
    createPost: await testCreatePost(),
  };

  if (results.createPost) {
    results.likePost = await testLikePost(results.createPost);
  }

  console.log("\n=== Test Results ===");
  console.log("Register:", results.register ? "✅" : "❌");
  console.log("Login:", results.login ? "✅" : "❌");
  console.log("Get User:", results.me ? "✅" : "❌");
  console.log("Create Post:", results.createPost ? "✅" : "❌");
  console.log("Like Post:", results.likePost ? "✅" : "❌");

  const allPassed = Object.values(results).every((r) => r === true || r);
  console.log("\nOverall:", allPassed ? "✅ All tests passed" : "❌ Some tests failed");
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };

