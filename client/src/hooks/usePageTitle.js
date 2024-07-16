import { useEffect, useState } from "react";

const usePageTitle = (title) => {
  const [pageTitle, setPageTitle] = useState(title);

  useEffect(() => {
    document.title = `${pageTitle} - ${'CampusConnect'}`;
  }, [pageTitle]);

  const changeTitle = (title) => {
    setPageTitle(title);
  };

  return {
    title: pageTitle,
    changeTitle,
  };
};

export default usePageTitle;