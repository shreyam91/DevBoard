const token = 'placeholder';
async function test() {
  const res = await fetch('https://api.github.com/repos/shreyam91/DevBoard/commits?per_page=10');
  console.log(res.status);
}
test();
