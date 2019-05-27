const resetInnerHtml = element => (element.innerHTML = null);

const generateUuid = () => {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const formatDate = date => {
  const appendZero = number => (number < 10 ? `0${number}` : number);

  return `${date.getFullYear()}-${appendZero(date.getMonth() + 1)}-${appendZero(
    date.getDate()
  )} ${appendZero(date.getHours())}:${appendZero(date.getMinutes())}`;
};

const clearSearchHistory = () => {
  localStorage.setItem("searchHistory", null);
  updateSearchHistoryList();
};

const getSearchHistory = () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  return searchHistory ? searchHistory : [];
};

const setSearchHistory = newHistory =>
  localStorage.setItem("searchHistory", JSON.stringify(newHistory));

const addToSearchHistory = newHistoryItem => {
  setSearchHistory([...getSearchHistory(), newHistoryItem]);
  updateSearchHistoryList();
};

const clearSearchInput = () =>
  (document.getElementById("search-input").value = "");

const updateSearchResult = (listElement, shows) => {
  const handleMouseDown = event => event.preventDefault();

  const handleClick = async newHistoryItem => {
    addToSearchHistory(newHistoryItem);
    // Awaiting the clearSearchInput() function to make sure the search-input value is empty
    await clearSearchInput();
    resetInnerHtml(listElement);
  };

  shows.forEach(show => {
    const li = document.createElement("li");

    const newHistoryItem = {
      id: generateUuid(),
      show,
      date: formatDate(new Date())
    };

    li.innerText = show;
    // Handling mousedown to stop the blur-event from the search-input
    li.onmousedown = handleMouseDown;
    li.onclick = () => handleClick(newHistoryItem).then(setShowListVisibility);
    listElement.appendChild(li);
  });
};

const handleInputChange = value => {
  fetchShowsByQueryString(value);
  setShowListVisibility();
};

const fetchShowsByQueryString = queryString => {
  const el = document.getElementById("show-list");

  resetInnerHtml(el);

  const getShowsFromData = data => data.map(showData => showData.show.name);

  fetch(`http://api.tvmaze.com/search/shows?q=${queryString}`).then(res =>
    res.json().then(data => updateSearchResult(el, getShowsFromData(data)))
  );
};

const handleBlur = () =>
  (document.getElementById("show-list").style.display = "none");

const setShowListVisibility = () => {
  const showList = document.getElementById("show-list");
  const input = document.getElementById("search-input");
  showList.style.display = input.value === "" ? "none" : "block";
};

const updateSearchHistoryList = () => {
  const el = document.getElementById("search-history-list");

  resetInnerHtml(el);

  const handleDelete = id => {
    const newHistory = getSearchHistory().filter(show => show.id !== id);
    setSearchHistory(newHistory);
    updateSearchHistoryList();
  };

  const generateListItem = historyItem => {
    const li = document.createElement("li");

    const name = document.createElement("b");
    name.className = "search-history-item-name";
    name.innerText = historyItem.show;

    const dateAndDeleteContainer = document.createElement("div");
    dateAndDeleteContainer.className = "date-and-delete";

    const date = document.createElement("div");
    date.className = "search-history-item-date";
    date.innerText = historyItem.date;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "search-history-item-delete";
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => handleDelete(historyItem.id);

    dateAndDeleteContainer.appendChild(date);
    dateAndDeleteContainer.appendChild(deleteBtn);

    li.appendChild(name);
    li.appendChild(dateAndDeleteContainer);

    return li;
  };

  getSearchHistory().forEach(historyItem =>
    el.appendChild(generateListItem(historyItem))
  );
};

window.onload = () => {
  updateSearchHistoryList();
};
