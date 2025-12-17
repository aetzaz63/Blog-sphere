// lib/api.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, method = "GET", body = null, headers = {}) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "API Error");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

//Register API
import { apiRequest } from "@/lib/api";

const onSubmit = async (data) => {
  try {
    const res = await apiRequest("/auth/register", "POST", {
      username: data.fullName,
      email: data.email,
      password: data.password,
    });
    setMessage(res.message || "Account created successfully!");
    setTimeout(() => router.push("/auth/login"), 2000);
  } catch (err) {
    setMessage(err.message || "Registration failed");
  }
};
//Login API
const onSubmit = async (data) => {
  try {
    const res = await apiRequest("/auth/login", "POST", data);
    setMessage("Login successful! Redirecting...");
    // Later you can store token:
    // localStorage.setItem("token", res.token);
    setTimeout(() => router.push("/"), 2000);
  } catch (err) {
    setMessage(err.message || "Invalid credentials");
  }
};

//Profile Update API
//Then in the form’s onSubmit, just replace:

console.log('Updated Profile Data:', data);
setMessage('Profile updated successfully!');


//with:

await apiRequest('/users/me', 'PUT', data);
setMessage('Profile updated successfully!');
// later if use (JWT), store the token in localStorage and include it:

headers: { Authorization: `Bearer ${token}` }


//You can prefill the form from backend data using:

useEffect(() => { fetchUserProfile(); }, []);


//to call apiRequest('/users/me')

export const generateMockPosts = (count) => {
  const categories = ['Technology', 'Design', 'Business', 'Lifestyle', 'Travel'];
  const authors = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Blog Post Title ${i + 1}`,
    content: `This is the content of blog post ${i + 1}. It provides insights into interesting topics.`,
    author: authors[Math.floor(Math.random() * authors.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    image: `https://picsum.photos/seed/${i + 1}/400/250`,
    ratings: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => Math.floor(Math.random() * 5) + 1),
    comments: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
      id: j + 1,
      author: authors[Math.floor(Math.random() * authors.length)],
      text: `This is comment ${j + 1} on post ${i + 1}`,
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    })),
  }));
};