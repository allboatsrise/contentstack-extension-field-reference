import React, { useMemo, useState } from "react";
import { InfiniteScrollTable as InfiniteScrollTableBase, Notification } from "@contentstack/venus-components";
import Contentstack from 'contentstack'
import { TableProps } from "@contentstack/venus-components/build/components/Table/types";

const InfiniteScrollTable = InfiniteScrollTableBase as React.FC<TableProps>


export const ContentstackReferenceFieldSelector: React.FC = () => {
  const [data, updateData] = useState([])
  const [totalCounts, updateTotalCounts] = useState(0)
  const [loading, updateLoading] = useState(false)

  const query = useMemo(() => {
    const stack = Contentstack.Stack({
      api_key: import.meta.env.VITE_CONTENTSTACK_STACK_API_KEY,
      delivery_token: import.meta.env.VITE_CONTENTSTACK_DELIVERY_TOKEN,
      environment: import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT,
      branch: import.meta.env.VITE_CONTENTSTACK_BRANCH
    })
    const query = stack.ContentType('Blog_Article').Query()
    return query
  }, [])
  
  const fetchData: TableProps['fetchTableData'] = async ({ sortBy, searchText, skip, limit }) => {
    console.log(sortBy, searchText)
    updateLoading(true)

    try {
      const [entries, total] = await query
        // .regex('title', searchText, 'i')
        // .ascending(sortBy)
        .skip(skip)
        .limit(limit)
        .includeCount()
        .toJSON()
        .find()
      
      updateData(entries)
      updateTotalCounts(total)
    } catch (error) {
      Notification({
        displayContent: { error: error },
        // notifyProps: {
          
        //   hideProgressBar: args.hideProgressBar,
        //   position: args.position,
        //   autoClose: args.autoClose,
        //   transition: args.transition,
        //   closeButton: args.closeButton
        // },
        type: 'error'
      })
    } finally {
      updateLoading(false)
    }
  }
  
  const columns = useMemo<TableProps['columns']>(
    () => [
      {
        Header: 'Title',
        id: 'title',
        accessor: (data: {title: string}) => {
          return <div className="content-title"> {data.title} </div>
        },
        // default: true,
        addToColumnSelector: true
      },
      {
        Header: 'Unique UID',
        accessor: 'uuid',
        default: false,
        addToColumnSelector: true,
        cssClass: 'uidCustomClass'
      },
    ],
    []
  )
  
  return (
    <InfiniteScrollTable
      data={data}
      columns={columns}
      uniqueKey={'uid'}
      loading={loading}
      totalCounts={totalCounts}
      minBatchSizeToFetch={30}
      initialSortBy={[{ id: 'age', desc: false }]}
      columnSelector={false}
      searchPlaceholder="Search"
      canSearch
      canRefresh
      tableHeight={500}
      rowPerPageOptions={[30, 50, 100]}
      fetchTableData={fetchData}
      isResizable
      v2Features={{
        "pagination": true,
        "isNewEmptyState": true
      }}
      onRowClick={(...args) => console.log(args)}
    />
  )
}
