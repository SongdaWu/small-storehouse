<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert
          title="修改商品信息"
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
      <!-- 修改商品的表单 -->
      <el-form
        ref="editFromRef"
        :model="editFrom"
        label-width="100px"
        :rules="editFromRules"
        label-position="top">
        <!-- 左侧索引栏 -->
        <el-tabs
        v-model="activeStep"
        :tab-position="'left'">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="'商品名称'" prop="goods_name">
              <el-input v-model="editFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input v-model="editFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editFrom.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editFrom.goods_number" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>

            <el-tab-pane label="商品参数" name="1">
              <el-form-item
               :label="item.attr_name"
               v-for="item in manyData"
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
              <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
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

          <!-- 富文本编辑框 -->
            <el-tab-pane label="商品内容" name="4">
              <quill-editor
                  ref="myQuillEditor"
                  v-model="editFrom.goods_introduce"
                />
                <!-- 确认按钮 -->
                <el-button
                type="primary"
                class="add-btn"
                @click="editBtn"
                @keyup.enter.native="editBtn">确认修改商品</el-button>
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
export default {
  name: 'Edit',
  data () {
    return {
      editFrom: {
        goods_name: '',
        goods_price: null,
        goods_number: null,
        goods_weight: null,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      activeStep: '0',
      // 基本信息校验规则
      editFromRules: {
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
    this.getGoodsInfo()
  },
  mounted () {
    console.log(this.editFrom)
  },
  methods: {
    async getGoodsInfo () {
      const { data: res } = await instance.get('goods/' + window.sessionStorage.getItem('editGoodsId'))
      if (res.meta.status !== 200) {
        this.$message.warning('获取商品信息失败，请稍后再试')
      } else {
        this.editFrom.goods_name = res.data.goods_name
        this.editFrom.goods_price = res.data.goods_price
        this.editFrom.goods_number = res.data.goods_number
        this.editFrom.goods_weight = res.data.goods_weight
        this.editFrom.goods_introduce = res.data.goods_introduce
        this.editFrom.attrs = res.data.attrs
        this.editFrom.attrs.forEach(item => {
          if (item.attr_sel === 'many') {
            item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(',')
          }
        })
        console.log(this.editFrom)
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
      console.log(this.editFrom.pics)
      // 1、先要获得将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2、从pics数组中找到该图片的索引值
      const i = this.editFrom.pics.findIndex(x => x.pic === filePath)
      // 3、调用数组的splice方法，将图片信息对象从pics中移走
      this.editFrom.pics.splice(i, 1)
      console.log(this.editFrom.pics)
    },
    // 图片上传成功的钩子
    handleSuccess (response) {
      // 1、 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、将图片信息对象，push到pics数组中
      this.editFrom.pics.push(picInfo)
      console.log(this.editFrom.pics)
    },
    // 确认修改按钮
    editBtn () {
      this.$refs.editFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
          this.$message.warning('请填写必要的表单项')
        } else {
          // 动态数据处理
          this.editFrom.attrs.forEach(item => {
            if (item.attr_vals === 'many') {
              item.attr_vals.join(',')
            }
            item = {
              attr_value: item.attr_vals
            }
            delete item.add_price
            delete item.attr_name
            delete item.attr_sel
            delete item.attr_vals
            delete item.attr_write
            delete item.goods_id
          })
          console.log(this.editFrom)
          const { data: res } = await instance.put('goods/' + window.sessionStorage.getItem('editGoodsId'), this.editFrom)
          if (res.meta.status !== 201) {
            this.$message.warning('修改失败，请稍后再试')
          } else {
            this.$message.success('修改商品成功')
            this.$router.push('/goods')
          }
        }
      })
    }
  },
  computed: {
    manyData () {
      return this.editFrom.attrs.filter(n => n.attr_sel === 'many')
    },
    onlyData () {
      return this.editFrom.attrs.filter(n => n.attr_sel === 'only')
    }
  }
}

</script>

<style>
</style>
