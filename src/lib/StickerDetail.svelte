<script>
  export let metadata;

  function assumeStickerResourceType() {
    if (metadata.hasAnimation && metadata.hasSound) {
      return "ANIMATION_SOUND";
    } else if (metadata.hasAnimation) {
      return "ANIMATION";
    } else if (metadata.hasSound) {
      return "SOUND";
    } else {
      return "STATIC";
    }
  }
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
      <th>ID</th>
      <td>{metadata.packageId}</td>
    </tr>
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
      <td>{metadata.stickerResourceType ?? assumeStickerResourceType()}</td>
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
    border-collapse: collapse;
  }

  th {
    text-align: right;
    white-space: nowrap;
  }

  td {
    text-align: left;
    padding-left: 1em;
    overflow-wrap: anywhere;
  }
</style>
