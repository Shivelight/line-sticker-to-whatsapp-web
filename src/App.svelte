<script>
  import * as zip from "@zip.js/zip.js";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

  import StickerDetail from "./lib/StickerDetail.svelte";

  const ffmpeg = createFFmpeg({ log: true });
  const nameRegex = /(\d+)@2x\.png/;

  let isError = false;
  let errorMessage = "";
  let loading = false;

  $: if (loading) isError = false;

  let stickerId;
  let metadata;
  let processedStk = 0;
  let downloadLink;

  async function getMetadata() {
    metadata = null;
    loading = true;
    try {
      const resp = await fetch(
        `https://stickershop.line-scdn.net/stickershop/v1/product/${stickerId}/android/productInfo.meta`
      ).then();

      if (resp.ok) {
        metadata = await resp.json();
      } else {
        errorMessage = "Failed to parse sticker metadata.";
        isError = true;
      }
    } catch (error) {
      errorMessage = error;
      isError = true;
    } finally {
      loading = false;
    }
  }

  async function convert() {
    processedStk = 0;
    if (!loading) loading = true;
    if (downloadLink && downloadLink.href) {
      URL.revokeObjectURL(downloadLink.href);
      downloadLink = null;
    }

    try {
      const zipReader = new zip.ZipReader(
        new zip.HttpReader(
          `https://stickershop.line-scdn.net/stickershop/v1/product/${stickerId}/iphone/stickers@2x.zip`
        )
      );
      const zipWriter = new zip.ZipWriter(
        new zip.BlobWriter("application/zip")
      );
      const entries = await zipReader.getEntries();

      for (const entry of entries) {
        if (nameRegex.test(entry.filename)) {
          const outFileName = nameRegex.exec(entry.filename)[1] + ".webp";
          const stkWriter = new zip.BlobWriter();
          const stkBlob = await entry.getData(stkWriter);
          ffmpeg.isLoaded() || (await ffmpeg.load());
          ffmpeg.FS("writeFile", entry.filename, await fetchFile(stkBlob));
          await ffmpeg.run(
            "-i",
            entry.filename,
            "-vf",
            "crop=in_w-10:in_h-10,scale=w=512:h=512:force_original_aspect_ratio=1,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0",
            outFileName
          );
          const data = ffmpeg.FS("readFile", outFileName);
          await zipWriter.add(outFileName, new zip.Uint8ArrayReader(data));
          ffmpeg.FS("unlink", outFileName);
          processedStk++;
        }
      }

      await zipReader.close();
      downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(await zipWriter.close());
      downloadLink.download = metadata.title.en + ".zip";
      downloadLink.click();
    } catch (error) {
      errorMessage = error;
      isError = true;
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <form on:submit|preventDefault={getMetadata}>
    <input
      type="number"
      bind:value={stickerId}
      placeholder="Enter LINE sticker pack ID"
      min="0"
      required
    />
    <hr />

    {#if isError}
      <p style="color: red">{errorMessage}</p>
    {/if}

    <button disabled={loading || null}>Get Data</button>
  </form>

  {#if metadata}
    <br />
    <div>
      <StickerDetail metadata={metadata} />
      <button on:click={convert} disabled={loading || null}
        >Convert to WhatsApp Sticker</button
      >
      {#if loading}
        <div>
          <hr />
          <p>
            Processing {processedStk} of {metadata.stickers.length} stickers..
          </p>
        </div>
      {/if}
    </div>
  {/if}
</main>

