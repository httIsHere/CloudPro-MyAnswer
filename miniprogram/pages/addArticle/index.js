// miniprogram/pages/addArticle/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasWords: false,
    title: '',
    content: '',
    category: ''
  },

  //监听输入框
  inputWacth: function (e) {
    let detail = e.detail.value
    this.setData({
      hasWords: detail === '' ? false : true,
      content: detail
    })
  },
  watchCate: function(e) {
    let detail = e.detail.value
    this.setData({
      category: detail
    })
  },
  watchTitle: function (e) {
    let detail = e.detail.value
    this.setData({
      title: detail
    })
  },

  submitArticle: function () {
    const _this = this;
    if (!this.data.hasWords) return
    if (!this.data.category || !this.data.title || !this.data.content) {
      return wx.showToast({
        title: '存在空信息...',
        icon: 'none',
        duration: 1000
      })
    }
    const db = wx.cloud.database()
    db.collection('articles').add({
      data: {
        title: _this.data.title,
        content: _this.data.content,
        category: _this.data.category,
        author: 'httishere',
        isDelete: false,
        comments: [],
        liked: 0
      },
      success: res => {
        wx.showToast({
          title: '文章发布成功~',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        _this.setData({
          title: '',
          content: '',
          category: ''
        })
        wx.navigateTo({
          url: '/pages/index/index',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '文章发布失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  // add admin
  addAdmin: function () {
    wx.cloud.callFunction({
      name: 'addAdmin',
      success: res => {
        console.log("==> [SUCCESS]", res)
      },
      fail: err => {
        console.error("==> [ERROR]", err)
      }
    })
  }
})