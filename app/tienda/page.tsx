export default async function Page() {
  const data = await fetch("https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhGBbTXEZPYGAn95_yCKHlPDEnm13Wq1pTj8ta5wy7CZEz-LVWTOavOyLq-leqEgtpKn7z2tG_9M8OVdCEYIMwYagFQKbIoMNzsD3FTFiPIcxNg0MaR6R153uVkD2V0_JewOqYNQ7BjpMOyXxecz73yQ--H1PdH5aoPjAx31CZb0aBAnIqNoBRscLFG6bPxOxrsmUlw-mryUwWAKG6ERljeJBiWCjGpHlce5XF6kr9856tXQNNp_4Ib7YuO8MN9x5M83UMgQdIkFjScofCwUKYivwUGtN96PDXwraPb&lib=MXMFpTI3n5QLB6u1bJIk0UUzTPsmGIWEC");
  const products = await data.json();
  console.log(products);

 <div></div> 
  return <h1>Hello World</h1>
}
