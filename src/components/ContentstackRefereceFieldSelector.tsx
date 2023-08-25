import React, { useMemo, useState } from "react";
import { InfiniteScrollTable as InfiniteScrollTableBase, Notification as BaseNotification } from "@contentstack/venus-components";
import Contentstack from 'contentstack'
import { TableProps } from "@contentstack/venus-components/build/components/Table/types";
import { NotificationItemProps } from "@contentstack/venus-components/build/components/Notification/Notification";

const InfiniteScrollTable = InfiniteScrollTableBase as React.FC<TableProps>
const Notification = BaseNotification as React.FC<NotificationItemProps>

type Props = {
  query: Contentstack.Query
  queryColumns: Array<{
    name: string;
    id: string;
  }>
  onReferenceSelected: (reference: {uid: string, [x: string]: unknown}) => void
}

export const ContentstackReferenceFieldSelector: React.FC<Props> = ({query, queryColumns, onReferenceSelected}) => {
  const [data, updateData] = useState([])
  const [totalCounts, updateTotalCounts] = useState(0)
  const [loading, updateLoading] = useState(false)
  
  const fetchData: TableProps['fetchTableData'] = async ({ sortBy, searchText, skip, limit }) => {
    updateLoading(true)

    try {
      let narrowedQuery = query
      if (searchText) {
        narrowedQuery = narrowedQuery.regex(queryColumns[0].id, searchText, 'i')
      }

      if (sortBy) {
        if (sortBy.sortingDirection === 'desc') {
          narrowedQuery = narrowedQuery.descending(sortBy.id)
        } else {
          narrowedQuery = narrowedQuery.ascending(sortBy.id)
        }
      }

      const [entries, total] = await narrowedQuery
        .skip(skip)
        .limit(limit)
        .includeCount()
        .toJSON()
        .find()
      
      updateData(entries)
      updateTotalCounts(total)
    } catch (error) {
      Notification({
        type: 'error',
        notificationContent: {
          text: 'Custom Reference Field Error',
          description: (error instanceof Error) ? error.message : 'Failed to load data - unknown error occurred',
        }
      })
    } finally {
      updateLoading(false)
    }
  }
  
  const columns = useMemo<TableProps['columns']>(
    () => queryColumns.map(({id, name}, index) => ({
      Header: name,
      id,
      accessor: id,
      columnWidthMultiplier: index === 0 ? 3 : 1,
    })),
    [queryColumns]
  )
  
  return (
    <div style={{
      marginTop: "-7px"
    }}>
    <InfiniteScrollTable
      data={data}
      columns={columns}
      uniqueKey="uid"
      loading={loading}
      totalCounts={totalCounts}
      minBatchSizeToFetch={100}
      initialSortBy={[{ id: queryColumns[queryColumns.length - 1].id, desc: true }]}
      columnSelector={false}
      searchPlaceholder="Search"
      canSearch
      canRefresh
      tableHeight={500}
      rowPerPageOptions={[10, 30, 50, 100]}
      fetchTableData={fetchData}
      itemSize={40}
      v2Features={{
        "pagination": true,
        "isNewEmptyState": true
      }}
      onRowClick={onReferenceSelected}
    />
    </div>
  )
}
