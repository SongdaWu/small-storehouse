<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert
          title="添加商品信息"
          type="info"
          center
          :closable="false"
          show-icon>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 添加商品的表单 -->
      <el-form
        ref="addFromRef"
        :model="addFrom"
        label-width="100px"
        :rules="addFromRules"
        label-position="top">
        <!-- 左侧索引栏 -->
        <el-tabs
        v-model="activeStep"
        :tab-position="'left'"
        :before-leave="beforeTabLeave"
        @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="'商品名称'" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input v-model="addFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addFrom.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item  label="商品分类" prop="goods_cat">
              <el-cascader
                  v-model="addFrom.goods_cat"
                  :options="cateList"
                  :props="cateProps"
                  style="width: 300px;"
                  @change="handleChange">
                  </el-cascader>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="商品参数" name="1">
              <el-form-item
               :label="item.attr_name"
               v-for="item in manyParmData"
               :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                   <el-checkbox
                   :label="item2"
                   v-for="(item2, index) in item.attr_vals"
                   :key="index"
                   border></el-checkbox>
                 </el-checkbox-group>
               </el-form-item>
            </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyParmData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的后台API地址-->
            <el-upload
              :action="uploadURl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑框 -->
            <quill-editor
                ref="myQuillEditor"
                v-model="addFrom.goods_introduce"
              />
              <!-- 确认按钮 -->
              <el-button type="primary" class="add-btn" @click="addBtn"  @keyup.enter.native="addBtn">确认添加商品</el-button>
              <!-- :options="editorOption"
                @blur="onEditorBlur($event)"
                @focus="onEditorFocus($event)"
                @ready="onEditorReady($event)" -->
          </el-tab-pane>
        </el-tabs>
       </el-form>
    </el-card>

    <!-- 图片预览对话框区域 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="30%">
      <img :src="previewPath" alt="" class="preview-pic">
    </el-dialog>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
import _ from 'lodash'
export default {
  name: 'Add',
  data () {
    return {
      activeStep: '0',
      // 添加商品信息的表单
      addFrom: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        // 图片临时路径的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 基本信息校验规则
      addFromRules: {
        goods_name: [
          {
            required: true,
            message: '一定要填商品名称哦',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '一定要填商品价格哦',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请填写商品重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '填个商品数量吧',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类列表
      cateList: [],

      // 联级选择器的配置文件
      cateProps: {
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        value: 'cat_id'
      },
      // 获取所选商品参数
      manyParmData: [],
      // 获取静态属性
      onlyParmData: [],
      // 图片上传地址
      uploadURl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 配置上传图片的请求头
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      // 保存图片的预览路径
      previewPath: '',
      // 控制图片预览对话框的显示
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获得商品分类列表
    async getCateList () {
      const { data: res } = await instance.get('categories')
      if (res.meta.status !== 200) {
        this.$message.warning('请求商品列表失败，请稍后再试')
      } else {
        this.cateList = res.data
      }
    },
    // 选择了商品分类后的操作
    handleChange () {
      if (this.addFrom.goods_cat.length < 3) {
        this.addFrom.goods_cat = []
      }
    },
    // 即将离开标签页时的钩子
    beforeTabLeave (activeName, oldActiveName) {
      // 如果还没有选择商品分类，则不可离开第一页标签
      if (this.addFrom.goods_cat.length !== 3) {
        this.$message.warning('请先选择商品分类')
        return false
      }
    },
    // 当索引栏被点击时的操作
    async tabClick () {
      if (this.activeStep === '1') {
        const { data: res } = await instance.get(`categories/${this.selectCateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          this.$message.warning('请求动态参数失败，请稍后再试')
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
          })
          this.manyParmData = res.data
        }
        this.manyParmData = res.data
      } else if (this.activeStep === '2') {
        const { data: res } = await instance.get(`categories/${this.selectCateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          this.$message.warning('请求静态属性失败，请稍后再试')
        } else {
          // res.data.forEach(item => {
          //   item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
          // })
          this.onlyParmData = res.data
        }
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove (file) {
      console.log(this.addFrom.pics)
      // 1、先要获得将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2、从pics数组中找到该图片的索引值
      const i = this.addFrom.pics.findIndex(x => x.pic === filePath)
      // 3、调用数组的splice方法，将图片信息对象从pics中移走
      this.addFrom.pics.splice(i, 1)
      console.log(this.addFrom.pics)
    },
    // 图片上传成功的钩子
    handleSuccess (response) {
      // 1、 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、将图片信息对象，push到pics数组中
      this.addFrom.pics.push(picInfo)
      console.log(this.addFrom.pics)
    },
    // 确认添加按钮
    addBtn () {
      // console.log(this.addFrom.goods_introduce)
      this.$refs.addFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
          this.$message.warning('请填写必要的表单项')
        } else {
          // lodash cloneDeep深克隆一个相同的对象
          const form = _.cloneDeep(this.addFrom)
          form.goods_cat = form.goods_cat.join(',')
          // console.log(form)
          // 动态数据处理
          this.manyParmData.forEach(item => {
            const info = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(',')
            }
            form.attrs.push(info)
          })
          // 静态数据处理
          this.onlyParmData.forEach(item => {
            const info = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            form.attrs.push(info)
          })
          console.log(form)
          // 发起添加商品的请求
          const { data: res } = await instance.post('goods', form)
          if (res.meta.status !== 201) {
            this.$message.warning('添加失败，请稍后再试')
          } else {
            this.$message.success('添加商品成功')
            this.$router.push('/goods')
          }
        }
      })
    }
  },
  computed: {
    selectCateId () {
      if (this.addFrom.goods_cat.length !== 3) {
        return null
      } else {
        return this.addFrom.goods_cat[2]
      }
    }
  }
}

</script>

<style>
</style>
