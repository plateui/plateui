import './table.css'
import http from '@/services/http'
import TableContent from './TableContent'
import Pagination from '../fragments/Pagination'

export default {
  name: 'table-data',
  props: {
    columns: Array,
    endpoint: String,
  },
  watch: {
    endpoint: {
      immediate: true,
      handler () {
        this.pagination = null
        this.items = []
        this.fetch()
      },
    },
  },
  data () {
    return {
      loading: true,
      items: [],
      pagination: null,
      orders: [],
    }
  },
  methods: {
    async fetch () {
      this.loading = true
      const url = this.endpoint
      const params = {}
      if (this.pagination) {
        params.page = this.pagination.page
      }
      const order = this.orders.map(d => {
        if (d.type === 'desc') {
          return `-${d.key}`
        } else if (d.type === 'asc') {
          return d.key
        }
      }).join(',')
      if (order) {
        params.order = order
      }
      const { pagination, items } = await http.paginate(url, params)

      this.items = items
      this.pagination = pagination
      this.loading = false
    },
    onOrder ({ key, type }) {
      let found = false
      this.orders = this.orders.map(o => {
        if (o.key === key) {
          found = true
          o.type = type
          return o
        }
        return o
      })
      if (!found) {
        this.orders.push({ key, type })
      }
      this.$set(this.pagination, 'page', 1)
      this.fetch()
    },
    onPage (page) {
      this.$set(this.pagination, 'page', page)
      this.fetch()
    },
  },
  render () {
    return (<div class="table">
      <div class="table_content">
        <TableContent items={this.items} columns={this.columns}
          onOrder={this.onOrder} />
        { !this.items.length && <div class="table_none">
          { !this.loading && <empty /> }
        </div> }
        { this.loading && <spinner /> }
      </div>
      { this.pagination && <div class="table_pagination">
        <Pagination { ...{ props: this.pagination } } onSelect={this.onPage} />
      </div> }
    </div>)
  },
}
