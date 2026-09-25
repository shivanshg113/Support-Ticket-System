package com.stms.dto;

import java.util.List;

/**
 * Generic paginated API response wrapper.
 * Returns data alongside pagination metadata so clients can implement paging UI.
 */
public class PagedResponse<T> {

    private List<T> content;
    private int     page;
    private int     size;
    private long    totalElements;
    private int     totalPages;

    public PagedResponse() {}

    public PagedResponse(List<T> content, int page, int size, long totalElements, int totalPages) {
        this.content       = content;
        this.page          = page;
        this.size          = size;
        this.totalElements = totalElements;
        this.totalPages    = totalPages;
    }

    public List<T> getContent()      { return content; }
    public int     getPage()         { return page; }
    public int     getSize()         { return size; }
    public long    getTotalElements(){ return totalElements; }
    public int     getTotalPages()   { return totalPages; }
}
