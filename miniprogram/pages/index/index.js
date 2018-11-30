//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    pageSize: 1,
    totalPage: 1,
    isLoading: false,
    isAdmin: false, // 关系到添加按钮的显示
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    this.getArticles()
    //是否为管理员用户
    this.isAdmin()
  },

  //上拉加载
  onReachBottom() {
    // 下拉触底，先判断是否有请求正在进行中
    // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
    if (this.isLoading || this.pageIndex > this.totalPage) return
    this.getArticles();
  },

  //获得文章列表
  getArticles: function () {
    const _this = this;
    _this.isLoading = true
    //query
    wx.cloud.callFunction({
      name: 'pagination',
      data: {
        dbName: 'articles',
        pageIndex: _this.pageIndex,
        pageSize: 8
      },
      success: res => {
        _this.isLoading = false
        console.log(res.result)
        _this.setData({
          queryResult: res.result.data,
          totalPage: res.result.totalPage,
          pageIndex: _this.pageIndex + 1
        })
      },
      fail: err => {
        console.log("==> [ERROR]", err)
      }
    })
  },

  //添加文章页
  toAddArticle: function () {
    wx.navigateTo({
      url: '/pages/addArticle/index',
    })
  },

  isAdmin: function () {
    const _this = this;
    if (app.globalData.isAdmin != null) {
      return _this.setData({
        isAdmin: app.globalData.isAdmin
      })
    }
    if (app.globalData.openId) {
      _this.isAdminReal(app.globalData.openId)
    } else {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log(res)
          var openId = res.result.openId
          app.globalData.openId = openId
          _this.isAdminReal(openId)
        }
      })
    }
  },
  isAdminReal: function (openId) {
    const _this = this;
    //请求判断是否为管理员
    wx.cloud.callFunction({
      name: 'isAdmin',
      data: {
        openId: openId
      },
      success: data => {
        if (data.result.data.length) {
          // 该用户为管理员
          _this.setData({
            isAdmin: true
          });
          app.globalData.isAdmin = true
        }
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})