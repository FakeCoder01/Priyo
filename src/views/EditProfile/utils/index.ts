
export const deleteUrlFromItem = (picture) => (currentPic) => {
  const pictureWithoutURL = {
    key: picture.newKey,
    url: "",
    disabledDrag: true,
    disabledReSorted: true,
  };
  return currentPic.key === picture.key ? pictureWithoutURL : currentPic;
};

export const addUrlToItem = (picture) => (currentPic) => {
  const pictureWithURL = {
    key: picture.newKey,
    url: picture.url,
    disabledDrag: false,
    disabledReSorted: false,
  };
  return currentPic.key === picture.key ? pictureWithURL : currentPic;

};