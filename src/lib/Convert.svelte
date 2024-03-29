<script>
  import * as zip from "@zip.js/zip.js";
  import sanitize from "sanitize-filename";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
  import StickerDetail from "./StickerDetail.svelte";

  const ffmpeg = createFFmpeg({
    log: true,
    // @ts-ignore
    corePath: navigator.deviceMemory == 8 ? "/ffmpeg-core.js" : "/ffmpeg-500/ffmpeg-core.js",
  });
  const nameRegex = /(\d+)@2x\.png/;
  const urlRegex = /(?:product|sticker)\/([0-9]+)/;

  let isError = false;
  let errorMessage = "";
  let loading = false;

  $: if (loading) isError = false;

  let stickerId;
  let stickerInput;
  let metadata;
  let processedStk = 0;
  let downloadLink;

  $: {
    if (urlRegex.test(stickerInput)) {
      stickerId = urlRegex.exec(stickerInput)[1];
    } else if (!isNaN(stickerInput)) {
      stickerId = parseInt(stickerInput);
    } else {
      stickerId = null;
    }
  }

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

    let packName = "stickers@2x.zip";
    if (metadata.hasAnimation) {
      packName = "stickerpack@2x.zip";
    }

    try {
      const zipReader = new zip.ZipReader(
        new zip.HttpReader(
          `https://stickershop.line-scdn.net/stickershop/v1/product/${stickerId}/iphone/${packName}`,
          {preventHeadRequest: true}
        )
      );
      const zipWriter = new zip.ZipWriter(
        new zip.BlobWriter("application/zip")
      );
      const entries = await zipReader.getEntries();

      for (const entry of entries) {
        if (
          nameRegex.test(entry.filename) &&
          (metadata.hasAnimation
            ? entry.filename.startsWith("animation")
            : true)
        ) {
          const fileName = nameRegex.exec(entry.filename)[1];
          const inFileName = fileName + ".png";
          const outFileName = fileName + ".webp";
          const stkWriter = new zip.BlobWriter();
          const stkBlob = await entry.getData(stkWriter);
          ffmpeg.isLoaded() || (await ffmpeg.load());
          ffmpeg.FS("writeFile", inFileName, await fetchFile(stkBlob));
          await ffmpeg.run(
            "-i",
            inFileName,
            "-vf",
            "crop=in_w-10:in_h-10,scale=w=512:h=512:force_original_aspect_ratio=1,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0",
            "-quality",
            "80",
            outFileName
          );
          const data = ffmpeg.FS("readFile", outFileName);
          await zipWriter.add(
            `${sanitize(metadata.title.en)}/${outFileName}`,
            new zip.Uint8ArrayReader(data)
          );
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
      ffmpeg.exit();
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={getMetadata}>
  <input
    id="stk"
    type="text"
    bind:value={stickerInput}
    placeholder="LINE sticker pack URL / ID"
    min="0"
    required
  />
  <hr />

  {#if isError}
    <p style="color: red">{errorMessage}</p>
  {/if}

  <button disabled={loading || !stickerId}>Get Data</button>
</form>

{#if metadata}
  <br />
  <div>
    <StickerDetail {metadata} />
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

<style>
  form {
    margin-top: 16px;
  }

  input {
    padding: 8px;
    border-radius: 8px;
    border-style: solid;
    width: 90%;
  }
</style>
