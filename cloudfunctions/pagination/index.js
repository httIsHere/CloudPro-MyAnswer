// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let dbName = event.dbName
  let filter = event.filter ? event.filter : null
  let pageIndex = event.pageIndex ? event.pageIndex : 1
  let pageSize = event.pageSize ? event.pageSize : 10
  const countResult = await db.collection(dbName).where(filter).count()
  const total = countResult.total
  const totalPage = Math.ceil(total / pageSize)
  let hasMore = true
  if(pageIndex > totalPage || pageIndex === totalPage) {
    hasMore = false
  }
  return db.collection(dbName).skip((pageIndex - 1) * pageSize).limit(pageSize).orderBy('_id', 'desc').get().then(res => {
    res.hasMore = hasMore
    res.totalPage = totalPage
    return res
  })
}