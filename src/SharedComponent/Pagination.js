import React, { useState } from 'react'
import ReactPaginate from 'react-paginate';

const itemsPerPage = 5
const Pagination = (props) => {
  const {totalItems, setItemOffset, itemOffset, pageRange=3, limit=itemsPerPage} = props;
  const pageCount = Math.ceil(totalItems / limit);


  const handlePageClick = (event) => {
    const newOffset = (event.selected);
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };


  return (
    <div style={{display:"flex", flexDirection:"row", gap:"10px", width:"100%", justifyContent:'center'}}>
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
    </div>
  )
}

export default Pagination