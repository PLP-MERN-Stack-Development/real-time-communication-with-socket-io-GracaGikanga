export const createPrivateChat = async (token, userId) => {
  const res = await fetch("http://localhost:5000/api/chat/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  return res.json();
};
