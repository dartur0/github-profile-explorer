async function getUser(username) {
try{
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error('User not found');
  }

  const data = await response.json();
  console.log(data);
  return data;

} catch (error) {
    console.log('Error:', error.message);
    return null;
}
}

getUser('этот-юзернейм-точно-не-существует-12345');