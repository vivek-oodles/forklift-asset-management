import React, { useState } from "react";
import ReactPaginate from "react-paginate";

const itemsPerPage = 5;
const Pagination = (props) => {
  const {
    totalItems,
    setItemOffset,
    itemOffset,
    pageRange = 3,
    limit = itemsPerPage,
  } = props;
  const pageCount = Math.ceil(totalItems / limit);

  const handlePageClick = (event) => {
    const newOffset = event.selected;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  const fromItem = itemOffset * limit + 1;
  const toItems =
    itemOffset * limit + limit >= totalItems
      ? totalItems
      : itemOffset * limit + limit;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ReactPaginate
        breakLabel="..."
        forcePage={itemOffset}
        nextLabel="Next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={pageRange}
        pageCount={pageCount}
        previousLabel="< Previous"
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        pageLinkClassName="page-num"
        nextLinkClassName="page-num"
        previousLinkClassName="page-num"
      />
      {totalItems > 0 && (
        <p style={{ marginTop: "31px", color: "#666", fontSize: "14px" }}>
          Showing {fromItem}-{toItems} of {totalItems}
        </p>
      )}
    </div>
  );
};

export default Pagination;
