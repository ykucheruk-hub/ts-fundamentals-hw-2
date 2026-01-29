import { getImagesByQuery } from "./pixabay-api";
import { initRender } from "./render-functions";
import Pagination from "./pagination";
import type { PixabayResponse } from "./types/pixabay";

const pagination = new Pagination();
let query = "";

const searchForm = document.querySelector<HTMLFormElement>(".form");
const loadMoreButton = document.querySelector<HTMLButtonElement>(".load-more");
const gallery = document.querySelector<HTMLElement>(".gallery");
const loader = document.querySelector<HTMLElement>(".loader");

if (!searchForm) throw new Error("Missing .form element in HTML");
if (!loadMoreButton) throw new Error("Missing .load-more element in HTML");
if (!gallery) throw new Error("Missing .gallery element in HTML");
if (!loader) throw new Error("Missing .loader element in HTML");

// Initialize render helpers with element instances
const ui = initRender({ gallery, loader, loadMoreButton });

searchForm.addEventListener("submit", onFormSubmit);
loadMoreButton.addEventListener("click", onLoadMoreClick);

async function onFormSubmit(event:SubmitEvent):Promise<void> {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const searchText = formData.get("search-text");
  
  query = typeof searchText === "string" ? searchText.trim() : "";

  if (query === "") {
    ui.showToast("Please enter a search query.");
    return;
  }

  pagination.reset();
  ui.clearGallery();
  ui.hideLoadMoreButton();
  await fetchAndRender();
  form.reset();
}

async function onLoadMoreClick():Promise<void> {
  pagination.next();
  await fetchAndRender();
}

async function fetchAndRender():Promise<void> {
  const isInitial = pagination.current === 1;
  try {
    ui.showLoader();
    ui.hideLoadMoreButton();

    const data:PixabayResponse = await getImagesByQuery(query, pagination.current);

    if (isInitial && data.hits.length === 0) {
      ui.showToast(
        "There are no images matching your search query. Try again!"
      );
      return;
    }

    ui.createGallery(data.hits);

    const isEndOfResults = pagination.isEnd(data.totalHits);
    if (isEndOfResults) {
      ui.hideLoadMoreButton();
      ui.showToast("You've reached the end of search results.");
      return;
    }

    ui.showLoadMoreButton();
  } catch {
    ui.showToast("An error occurred while fetching images. Try again.");
  } finally {
    ui.hideLoader();
  }
}