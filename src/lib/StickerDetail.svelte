<script>
  export let metadata;
</script>

<div>
  <a
    href="https://store.line.me/stickershop/product/{metadata.packageId}"
    target="_blank"
    rel="noreferrer"
  >
    <img
      crossorigin="anonymous"
      src="https://stickershop.line-scdn.net/stickershop/v1/product/{metadata.packageId}/android/main.png"
      alt="Main Sticker"
    />
  </a>
  <table width="100%">
    <tr>
      <th>Title</th>
      <td>{metadata.title.en}</td>
    </tr>
    <tr>
      <th>Author</th>
      <td>{metadata.author.en}</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>{metadata.stickerResourceType || "STATIC"}</td>
    </tr>
    <tr>
      <th># Stickers</th>
      <td>{metadata.stickers.length}</td>
    </tr>
  </table>
</div>

<style>
  table {
    margin-bottom: 12px;
  }
  th {
    text-align: right;
  }
  td {
    text-align: left;
    padding: 0 15px;
  }
</style>
