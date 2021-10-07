const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const User = require("../models/Users");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const path = require("path");
// var ObjectId = require("mongodb").ObjectID;
module.exports = {
  viewSignIn: async (req, res) => {
    try {
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
      };
      if (req.session.user == null || req.session.user == undefined) {
        res.render("index", {
          alert,
          title: "Staycation | Login",
        });
      } else {
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/signin");
    }
  },
  actionSignIn: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        req.flash("message", "User No found");
        req.flash("status", "danger");
        res.redirect("/admin/signin");
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash("message", "Wrong Password");
        req.flash("status", "danger");
        res.redirect("/admin/signin");
      }
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/signin");
    }
  },
  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/admin/signin");
  },

  viewDashboard: async (req, res) => {
    try {
      const member = await Member.find();
      const bookings = await Booking.find();
      const item = await Item.find();
      res.render("admin/dashboard/view_dashboard", {
        title: "Staycation | Dashboard",
        user: req.session.user,
        member,
        bookings,
        item,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/signin");
    }
  },
  viewCategory: async (req, res) => {
    try {
      const category = await Category.find();
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
        title: "Staycation | Category",
        user: req.session.user,
      };
      res.render("admin/category/view_category", {
        category,
        alert,
        title: "Staycation | Category",
        user: req.session.user,
      });
    } catch (error) {
      res.redirect("/admin/category");
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });
      req.flash("message", "success add category");
      req.flash("status", "success");
      res.redirect("/admin/category");
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/category");
    }
  },
  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      const _id = id.slice(0, -1);
      const category = await Category.findOne({ _id: _id });
      console.log(category);
      category.name = name;
      await category.save();
      req.flash("message", "Success Update Category");
      req.flash("status", "success");
      res.redirect("/admin/category");
    } catch (error) {
      console.log("===>", error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/category");
    }
  },

  deleteCategory: async (req, res) => {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id });
    await category.remove();
    req.flash("message", "success delete category");
    req.flash("status", "success");
    res.redirect("/admin/category");
  },

  // Bank
  viewBank: async (req, res) => {
    try {
      const banks = await Bank.find();
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
        title: "Staycation | Category",
      };
      res.render("admin/bank/view_bank", {
        title: "Staycation | Bank",
        alert,
        banks,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("message", "success delete category");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    }
  },

  addBank: async (req, res) => {
    try {
      const { name, nameBank, nomorRekening } = req.body;
      await Bank.create({
        name,
        nameBank,
        nomorRekening,
        imageUrl: `images/${req.file.filename}`,
      });
      req.flash("message", "success delete category");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      req.flash("message", "success delete category");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    }
  },

  editBank: async (req, res) => {
    try {
      const { id, name, nameBank, nomorRekening } = req.body;
      const bank = await Bank.findOne({ _id: id });
      if (req.file === undefined) {
        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        await bank.save();
        req.flash("message", "success edit Bank");
        req.flash("status", "success");
        res.redirect("/admin/bank");
      } else {
        await fs.unlink(path.join(`public/${bank.imageUrl}`));
        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        bank.imageUrl = `images/${req.file.filename}`;
        await bank.save();
        req.flash("message", "success edit Bank");
        req.flash("status", "success");
        res.redirect("/admin/bank");
      }
      req.flash("message", "success update bank");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      req.flash("message", "Fail update bank");
      req.flash("status", "danger");
      res.redirect("/admin/bank");
    }
  },
  deleteBank: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const bank = await Bank.findOne({ _id: id });
      await fs.unlink(path.join(`public/${bank.imageUrl}`));
      await bank.remove();
      req.flash("message", "success delete bank");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      console.log(error);
      req.flash("message", "Fail delete bank");
      req.flash("status", "danger");
      res.redirect("/admin/bank");
    }
  },

  viewItem: async (req, res) => {
    try {
      const categories = await Category.find();
      const items = await Item.find()
        .populate({
          path: "imageId",
          select: "id imageUrl",
        })
        .populate({ path: "categoryId", select: "id name" });

      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
      };
      res.render("admin/item/view_item", {
        title: "Staycation | Item",
        categories,
        alert,
        items,
        action: "view",
        user: req.session.user,
      });
    } catch (error) {
      req.flash("message", "Fail delete bank");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },
  addItem: async (req, res) => {
    try {
      const { categoryId, title, price, city, about } = req.body;
      if (req.files.length > 0) {
        const category = await Category.findOne({
          _id: categoryId.slice(0, -1),
        });
        console.log(category);
        const newItem = {
          categoryId: category._id,
          title,
          description: about,
          price,
          city,
        };
        const item = await Item.create(newItem);
        category.itemId.push({ _id: item._id });
        await category.save();
        for (let i = 0; i < req.files.length; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          });
          item.imageId.push({ _id: imageSave._id });
          await item.save();
        }
        req.flash("message", "success add item");
        req.flash("status", "success");
        res.redirect("/admin/item");
      }
    } catch (error) {
      req.flash("message", "Fail add item");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },
  showImageItem: async (req, res) => {
    try {
      const { id } = req.params;
      const categories = await Category.find();
      const items = await Item.findOne({ _id: id }).populate({
        path: "imageId",
        select: "id imageUrl",
      });
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
      };
      res.render("admin/item/view_item", {
        title: "Staycation | Show Image Item",
        categories,
        alert,
        items,
        action: "show image",
        user: req.session.user,
      });
    } catch (error) {}
  },
  showEditItem: async (req, res) => {
    try {
      const { id } = req.params;
      const categories = await Category.find();
      const items = await Item.findOne({ _id: id })
        .populate({
          path: "imageId",
          select: "id imageUrl",
        })
        .populate({
          path: "categoryId",
          select: "id name",
        });
      console.log(items);
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
      };
      res.render("admin/item/view_item", {
        title: "Staycation | Edit Item",
        categories,
        alert,
        items,
        categories,
        action: "edit",
        user: req.session.user,
      });
    } catch (error) {
      req.flash("message", "Fail add item");
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  editItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, title, price, city, about } = req.body;
      const items = await Item.findOne({ _id: id })
        .populate({
          path: "imageId",
          select: "id imageUrl",
        })
        .populate({
          path: "categoryId",
          select: "id name",
        });
      if (req.files.length > 0) {
        for (let i = 0; i < items.imageId.length; i++) {
          const imageUpdate = await Image.findOne({
            _id: items.imageId[i]._id,
          });
          await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
          imageUpdate.imageUrl = `images/${req.files[i].filename}`;
          await imageUpdate.save();
        }
        items.title = title;
        items.price = price;
        items.city = city;
        items.description = about;
        items.categoryId = categoryId.slice(0, -1);
        await items.save();
        req.flash("message", "success update item");
        req.flash("status", "success");
        res.redirect("/admin/item");
      } else {
        items.title = title;
        items.price = price;
        items.city = city;
        items.description = about;
        items.categoryId = categoryId.slice(0, -1);
        await items.save();
        req.flash("message", "success update item");
        req.flash("status", "success");
        res.redirect("/admin/item");
      }
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const items = await Item.findOne({ _id: id }).populate("imageId");
      for (let i = 0; i < items.imageId.length; i++) {
        Image.findOne({ _id: items.imageId[i]._id })
          .then((image) => {
            fs.unlink(path.join(`public/${image.imageUrl}`));
            image.remove();
          })
          .catch((error) => {
            req.flash("message", `${error.message}`);
            req.flash("status", "danger");
            res.redirect("/admin/item");
          });
      }
      await items.remove();
      req.flash("message", "success delete item");
      req.flash("status", "success");
      res.redirect("/admin/item");
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect("/admin/item");
    }
  },

  viewDetailItem: async (req, res) => {
    try {
      const { itemId } = req.params;
      const message = req.flash("message");
      const status = req.flash("status");
      const features = await Feature.find({ itemId: itemId });
      const activities = await Activity.find({ itemId: itemId });
      const alert = {
        message: message,
        status: status,
      };
      res.render("admin/item/detail_item/view_detail_item", {
        title: "Staycation | Detail Item",
        alert,
        itemId,
        features,
        activities,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },

  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash("message", "image not found");
        req.flash("status", "danger");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });
      const item = await Item.findOne({ _id: itemId });
      item.featureId.push({ _id: feature._id });
      await item.save();
      req.flash("message", "Success Add Feature");
      req.flash("status", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body;
    try {
      const feature = await Feature.findOne({ _id: id });
      if (req.file === undefined) {
        feature.name = name;
        feature.qty = qty;
        await feature.save();
        req.flash("message", "success edit Feature");
        req.flash("status", "success");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } else {
        await fs.unlink(path.join(`public/${feature.imageUrl}`));
        feature.name = name;
        feature.qty = qty;
        feature.imageUrl = `images/${req.file.filename}`;
        await feature.save();
        req.flash("message", "success edit Feature");
        req.flash("status", "success");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      req.flash("message", "success update bank");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },

  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const feature = await Feature.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId }).populate("featureId");
      for (let i = 0; i < item.featureId.length; i++) {
        if (item.featureId[i]._id.toString() === feature._id.toString()) {
          item.featureId.pull({ _id: feature._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${feature.imageUrl}`));
      await feature.remove();
      req.flash("message", "success delete feature");
      req.flash("status", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      console.log(error);
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash("message", "image not found");
        req.flash("status", "danger");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });
      const item = await Item.findOne({ _id: itemId });
      item.activityId.push({ _id: activity._id });
      await item.save();
      req.flash("message", "Success Add Activity");
      req.flash("status", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },

  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body;
    try {
      const activity = await Activity.findOne({ _id: id });
      if (req.file === undefined) {
        activity.name = name;
        activity.type = type;
        await activity.save();
        req.flash("message", "success edit activity");
        req.flash("status", "success");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } else {
        await fs.unlink(path.join(`public/${activity.imageUrl}`));
        activity.name = name;
        activity.type = type;
        activity.imageUrl = `images/${req.file.filename}`;
        await activity.save();
        req.flash("message", "success edit activity");
        req.flash("status", "success");
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
      req.flash("message", "success update bank");
      req.flash("status", "success");
      res.redirect("/admin/bank");
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const activity = await Activity.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId }).populate("activityId");
      for (let i = 0; i < item.activityId.length; i++) {
        if (item.activityId[i]._id.toString() === activity._id.toString()) {
          item.activityId.pull({ _id: activity._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${activity.imageUrl}`));
      await activity.remove();
      req.flash("message", "success delete activity");
      req.flash("status", "success");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },

  viewBooking: async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate("memberId")
        .populate("bankId");

      res.render("admin/booking/view_booking", {
        title: "Staycation | Booking",
        user: req.session.user,
        bookings,
      });
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking`);
    }
  },
  showDetailBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const bookings = await Booking.findOne({ _id: id })
        .populate("memberId")
        .populate("bankId");
      const message = req.flash("message");
      const status = req.flash("status");
      const alert = {
        message: message,
        status: status,
      };
      res.render("admin/booking/show_detail_booking", {
        title: "Staycation | Detail Booking",
        user: req.session.user,
        bookings,
        alert,
      });
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking`);
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const bookings = await Booking.findOne({ _id: id });
      bookings.payments.status = "Accept";
      await bookings.save();
      req.flash("message", "payment confirmation success");
      req.flash("status", "success");
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking/${id}`);
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const bookings = await Booking.findOne({ _id: id });
      bookings.payments.status = "Reject";
      await bookings.save();
      req.flash("message", "payment reject success");
      req.flash("status", "success");
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      req.flash("message", `${error.message}`);
      req.flash("status", "danger");
      res.redirect(`/admin/booking/${id}`);
    }
  },
};
