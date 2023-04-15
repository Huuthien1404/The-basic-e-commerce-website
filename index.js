const express = require('express');
const { engine } =require('express-handlebars');
const app = express();
const passport= require('passport');
const path = require('path');
const multer = require('multer');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID='744315959252-0ibm2bsbamln8236ihpm47hrhu24usq9.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET='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';
const session =require('express-session');
const client=require('./config/api');
const flash=require('express-flash');
var storage = multer.diskStorage({
    destination: (req, file, res) =>{
        res(null, './public');
    },
    filename: (req, file, res) =>{
        res(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
})
app.use(session({
    secret: 'Nhuquynh89#',
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*15
    }
}));
app.engine('hbs', engine({
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({
    extended: true
}));
client.connect();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
  },
  function(accessToken, refreshToken, profile, done){
    return done(null, profile);
  }
));
passport.serializeUser((user, done) =>{
    return done(null, user);
});
passport.deserializeUser((user, done) =>{
    return done(null, user);
});

app.get('/',redirectToDashboard, (req,res) =>{
    res.send(`<a href="/auth/google">Đăng nhập với google</a>`);
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email','profile'] })
);

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/dashboard');
  });

app.get('/users/dashboard',checkLogin, (req,res) =>{
    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
        if (err) throw err;
        var msg='';
        var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
        for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
        req.flash("list_option_product",`${msg}`);
        req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:0; visibility: hidden; display:none}</style>`);
        req.flash("list_option_product1",`${msg1}`);
        res.render('productsview');
    })
});

app.post('/users/dashboard',checkLogin, upload.single('add_link_img_product') , (req, res) => {
    if (req.body.quantity_all_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_all_product}, ${req.body.quantity_all_product}, ${req.body.Total_buy_all_product}, '${req.body.username_buy_all_product}', ${req.body.Price_buy_all_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_another_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_another_product}, ${req.body.quantity_another_product}, ${req.body.Total_buy_another_product}, '${req.body.username_buy_another_product}', ${req.body.Price_buy_another_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_jewelry_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_jewelry_product}, ${req.body.quantity_jewelry_product}, ${req.body.Total_buy_jewelry_product}, '${req.body.username_buy_jewelry_product}', ${req.body.Price_buy_jewelry_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_laptop_pc_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_laptop_pc_product}, ${req.body.quantity_laptop_pc_product}, ${req.body.Total_buy_laptop_pc_product}, '${req.body.username_buy_laptop_pc_product}', ${req.body.Price_buy_laptop_pc_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_shirt_shoe_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_shirt_shoe_product}, ${req.body.quantity_shirt_shoe_product}, ${req.body.Total_buy_shirt_shoe_product}, '${req.body.username_buy_shirt_shoe_product}', ${req.body.Price_buy_shirt_shoe_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_camera_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_camera_product}, ${req.body.quantity_camera_product}, ${req.body.Total_buy_camera_product}, '${req.body.username_buy_camera_product}', ${req.body.Price_buy_camera_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_phone_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_phone_product}, ${req.body.quantity_phone_product}, ${req.body.Total_buy_phone_product}, '${req.body.username_buy_phone_product}', ${req.body.Price_buy_phone_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.quantity_book_product!=undefined){
        client.query(`select count(*) from public.orders`, (err, results) => {
            if (err) throw err;
            var count_order=Number(results.rows[0].count);
            client.query(`INSERT INTO public.orders(
                "orderID", "productID", "quantitesProduct", "Total", username, "priceProduct")
                VALUES (${count_order+1}, ${req.body.productId_buy_book_product}, ${req.body.quantity_book_product}, ${req.body.Total_buy_book_product}, '${req.body.username_buy_book_product}', ${req.body.Price_buy_book_product});`, (err, results) => {
                    if (err) throw err;
                    client.query(`update public."Products"
                    set "Quantity"="Quantity"-(
                        select a."quantitesProduct"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )
                    where "ProID"=(
                        select a."productID"
                        from public.orders as a
                        where a."orderID"=(
                            select count(*)
                            from public.orders
                        )
                    )`, (err,results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">buy_success</div>`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
        })
    }
    if (req.body.click_book_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_book_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_book_product_to_buy"><input type="text" class="click_book_product_to_buy" name="click_book_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_book_product" onsubmit="event.preventDefault();handle_submit_form_buy_book_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_book_product" class="quantity_book_product" oninput="handle_on_input_quantity_product()" onclick="handle_click_quantity_book_product()" required><input type="text" class="username_buy_book_product" value="${req.user.username}" name="username_buy_book_product"><input type="text" class="productId_buy_book_product" name="productId_buy_book_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_book_product" name="Price_buy_book_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_book_product" name="Total_buy_book_product" value=""><input type="text" class="remainQuantity_buy_book_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_book_product"><div class="price_money_book_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_book_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_book_product" value="Đặt hàng"><p class="error_input_quantity_book_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_phone_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_phone_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_phone_product_to_buy"><input type="text" class="click_phone_product_to_buy" name="click_phone_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_phone_product" onsubmit="event.preventDefault();handle_submit_form_buy_phone_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_phone_product" class="quantity_phone_product" oninput="handle_on_input_quantity_product1()" onclick="handle_click_quantity_phone_product()" required><input type="text" class="username_buy_phone_product" value="${req.user.username}" name="username_buy_phone_product"><input type="text" class="productId_buy_phone_product" name="productId_buy_phone_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_phone_product" name="Price_buy_phone_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_phone_product" name="Total_buy_phone_product" value=""><input type="text" class="remainQuantity_buy_phone_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_phone_product"><div class="price_money_phone_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_phone_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_phone_product" value="Đặt hàng"><p class="error_input_quantity_phone_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_camera_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_camera_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_camera_product_to_buy"><input type="text" class="click_camera_product_to_buy" name="click_camera_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_camera_product" onsubmit="event.preventDefault();handle_submit_form_buy_camera_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_camera_product" class="quantity_camera_product" oninput="handle_on_input_quantity_product2()" onclick="handle_click_quantity_camera_product()" required><input type="text" class="username_buy_camera_product" value="${req.user.username}" name="username_buy_camera_product"><input type="text" class="productId_buy_camera_product" name="productId_buy_camera_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_camera_product" name="Price_buy_camera_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_camera_product" name="Total_buy_camera_product" value=""><input type="text" class="remainQuantity_buy_camera_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_camera_product"><div class="price_money_camera_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_camera_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_camera_product" value="Đặt hàng"><p class="error_input_quantity_camera_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_shirt_shoe_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_shirt_shoe_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_shirt_shoe_product_to_buy"><input type="text" class="click_shirt_shoe_product_to_buy" name="click_shirt_shoe_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_shirt_shoe_product" onsubmit="event.preventDefault();handle_submit_form_buy_shirt_shoe_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_shirt_shoe_product" class="quantity_shirt_shoe_product" oninput="handle_on_input_quantity_product3()" onclick="handle_click_quantity_shirt_shoe_product()" required><input type="text" class="username_buy_shirt_shoe_product" value="${req.user.username}" name="username_buy_shirt_shoe_product"><input type="text" class="productId_buy_shirt_shoe_product" name="productId_buy_shirt_shoe_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_shirt_shoe_product" name="Price_buy_shirt_shoe_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_shirt_shoe_product" name="Total_buy_shirt_shoe_product" value=""><input type="text" class="remainQuantity_buy_shirt_shoe_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_shirt_shoe_product"><div class="price_money_shirt_shoe_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_shirt_shoe_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_shirt_shoe_product" value="Đặt hàng"><p class="error_input_quantity_shirt_shoe_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_laptop_pc_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_laptop_pc_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_laptop_pc_product_to_buy"><input type="text" class="click_laptop_pc_product_to_buy" name="click_laptop_pc_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_laptop_pc_product" onsubmit="event.preventDefault();handle_submit_form_buy_laptop_pc_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_laptop_pc_product" class="quantity_laptop_pc_product" oninput="handle_on_input_quantity_product4()" onclick="handle_click_quantity_laptop_pc_product()" required><input type="text" class="username_buy_laptop_pc_product" value="${req.user.username}" name="username_buy_laptop_pc_product"><input type="text" class="productId_buy_laptop_pc_product" name="productId_buy_laptop_pc_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_laptop_pc_product" name="Price_buy_laptop_pc_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_laptop_pc_product" name="Total_buy_laptop_pc_product" value=""><input type="text" class="remainQuantity_buy_laptop_pc_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_laptop_pc_product"><div class="price_money_laptop_pc_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_laptop_pc_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_laptop_pc_product" value="Đặt hàng"><p class="error_input_quantity_laptop_pc_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_jewelry_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_jewelry_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_jewelry_product_to_buy"><input type="text" class="click_jewelry_product_to_buy" name="click_jewelry_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_jewelry_product" onsubmit="event.preventDefault();handle_submit_form_buy_jewelry_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_jewelry_product" class="quantity_jewelry_product" oninput="handle_on_input_quantity_product5()" onclick="handle_click_quantity_jewelry_product()" required><input type="text" class="username_buy_jewelry_product" value="${req.user.username}" name="username_buy_jewelry_product"><input type="text" class="productId_buy_jewelry_product" name="productId_buy_jewelry_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_jewelry_product" name="Price_buy_jewelry_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_jewelry_product" name="Total_buy_jewelry_product" value=""><input type="text" class="remainQuantity_buy_jewelry_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_jewelry_product"><div class="price_money_jewelry_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_jewelry_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_jewelry_product" value="Đặt hàng"><p class="error_input_quantity_jewelry_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_another_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_another_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_another_product_to_buy"><input type="text" class="click_another_product_to_buy" name="click_another_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_another_product" onsubmit="event.preventDefault();handle_submit_form_buy_another_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_another_product" class="quantity_another_product" oninput="handle_on_input_quantity_product6()" onclick="handle_click_quantity_another_product()" required><input type="text" class="username_buy_another_product" value="${req.user.username}" name="username_buy_another_product"><input type="text" class="productId_buy_another_product" name="productId_buy_another_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_another_product" name="Price_buy_another_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_another_product" name="Total_buy_another_product" value=""><input type="text" class="remainQuantity_buy_another_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_another_product"><div class="price_money_another_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_another_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_another_product" value="Đặt hàng"><p class="error_input_quantity_another_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.click_all_product_to_buy!=undefined){
        client.query(`select* from public."Products" as a, public."Categories" as b  where a."CatID"=b."CatID" and a."ProName"='${req.body.click_all_product_to_buy}'`, (err,results) => {
            if (err) throw err;
            var msg='';
            for(var i=0;i<1;i++){
                msg = msg + `<div class="card-item"><form method="post" action="/users/dashboard" class="form_click_all_product_to_buy"><input type="text" class="click_all_product_to_buy" name="click_all_product_to_buy" value=""></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt="avatar"></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><form method="post" action="/users/dashboard" class="form_buy_all_product" onsubmit="event.preventDefault();handle_submit_form_buy_all_product()"><input type="number" placeholder="Nhập số lượng" name="quantity_all_product" class="quantity_all_product" oninput="handle_on_input_quantity_product7()" onclick="handle_click_quantity_all_product()" required><input type="text" class="username_buy_all_product" value="${req.user.username}" name="username_buy_all_product"><input type="text" class="productId_buy_all_product" name="productId_buy_all_product" value="${results.rows[i].ProID}"><input type="text" class="Price_buy_all_product" name="Price_buy_all_product" value="${results.rows[i].Price}"><input type="text" class="Total_buy_all_product" name="Total_buy_all_product" value=""><input type="text" class="remainQuantity_buy_all_product" value="${results.rows[i].Quantity}" name="remainQuantity_buy_all_product"><div class="price_money_all_product">Giá tiền: ${results.rows[i].Price}₫</div><div class="total_money_all_product">Thành tiền: 0₫</div><input type="submit" class="submit_buy_all_product" value="Đặt hàng"><p class="error_input_quantity_all_product">Số sản phẩm phải lớn hơn 0</p></form></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.update_name_product!=undefined){
        var cid;
        if (req.body.update_select_product[1]=='book') cid=1;
        else if (req.body.update_select_product[1]=='phone') cid=2;
        else if (req.body.update_select_product[1]=='camera') cid=3;
        else if (req.body.update_select_product[1]=='shirt_shoe') cid=4;
        else if (req.body.update_select_product[1]=='laptop_pc') cid=5;
        else if (req.body.update_select_product[1]=='jewelry') cid=6;
        else if (req.body.update_select_product[1]=='another') cid=7;
        var name_string=req.body.update_name_product.toString();
        client.query(`update public."Products" set  "ProName"='${name_string}', "TinyDes"='${req.body.update_tinyDes_product}', "FullDes"='${req.body.update_fullDes_product}', "Price"=${Number(req.body.update_price_product)}, "CatID"=${cid}, "Quantity"=${Number(req.body.update_quantity_product)}, "LinkImg"='http://localhost:3000/${req.file.originalname}' where "ProName"='${req.body.clone_old_name}'`, (err, results) => {
            if (err) throw err;
            req.flash("notification",`<div class="notification" onload="handle_onload_notification()">update_success</div>`);
            count=0;
            res.redirect('/users/dashboard');
        })
    }
    if (req.body.clone_select_update_product!=undefined){
        var productI=Number(req.body.clone_select_update_product);
        client.query(`select* from public."Products" as a, public."Categories" as b where a."ProID"=${productI} and a."CatID"=b."CatID" order by a."ProID"`, (err, results) => {
            if (err) throw err;
            if (results.rows[0].CatID==1){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product:`${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    update_select_option1: 'book',
                    update_view_select_option1:'Sách',
                    update_select_option2: 'phone',
                    update_view_select_option2:'Điện thoại',
                    update_select_option3: 'camera',
                    update_view_select_option3:'Máy chụp hình',
                    update_select_option4: 'shirt_shoe',
                    update_view_select_option4:'Quần áo - Giày dép',
                    update_select_option5: 'laptop_pc',
                    update_view_select_option5:'Máy tính',
                    update_select_option6: 'jewelry',
                    update_view_select_option6:'Đồ trang sức',
                    update_select_option7: 'another',
                    update_view_select_option7:'khác',
                    old_name: `${results.rows[0].ProName}`
                }
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==2){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product:`${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'phone',
                    update_view_select_option1:'Điện thoại',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'camera',
                    update_view_select_option3:'Máy chụp hình',
                    update_select_option4: 'shirt_shoe',
                    update_view_select_option4:'Quần áo - Giày dép',
                    update_select_option5:'laptop_pc',
                    update_view_select_option5:'Máy tính',
                    update_select_option6: 'jewelry',
                    update_view_select_option6:'Đồ trang sức',
                    update_select_option7: 'another',
                    update_view_select_option7:'Khác',
                    old_name: `${results.rows[0].ProName}`
                };
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==3){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product: `${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'camera',
                    update_view_select_option1:'Máy chụp hình',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'phone',
                    update_view_select_option3:'Điện thoại',
                    update_select_option4: 'shirt_shoe',
                    update_view_select_option4:'Quần áo - Giày dép',
                    update_select_option5: 'laptop_pc',
                    update_view_select_option5:'Máy tính',
                    update_select_option6: 'jewelry',
                    update_view_select_option6:'Đồ trang sức',
                    update_select_option7: 'another',
                    update_view_select_option7:'khác',
                    old_name: `${results.rows[0].ProName}`
                }
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==4){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product:`${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'shirt_shoe',
                    update_view_select_option1:'Quần áo - Giày dép',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'phone',
                    update_view_select_option3:'Điện thoại',
                    update_select_option4: 'camera',
                    update_view_select_option4:'Máy chụp hình',
                    update_select_option5: 'laptop_pc',
                    update_view_select_option5:'Máy tính',
                    update_select_option6: 'jewelry',
                    update_view_select_option6:'Đồ trang sức',
                    update_select_option7: 'another',
                    update_view_select_option7:'khác',
                    old_name: `${results.rows[0].ProName}`
                };
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==5){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product:`${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'laptop_pc',
                    update_view_select_option1:'Máy tính',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'phone',
                    update_view_select_option3:'Điện thoại',
                    update_select_option4: 'camera',
                    update_view_select_option4:'Máy chụp hình',
                    update_select_option5: 'shirt_shoe',
                    update_view_select_option5:'Quần áo - Giày dép',
                    update_select_option6: 'jewelry',
                    update_view_select_option6:'Đồ trang sức',
                    update_select_option7: 'another',
                    update_view_select_option7:'khác',
                    old_name: `${results.rows[0].ProName}`
                };
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==6){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product:`${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'jewelry',
                    update_view_select_option1:'Đồ trang sức',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'phone',
                    update_view_select_option3:'Điện thoại',
                    update_select_option4: 'camera',
                    update_view_select_option4:'Máy chụp hình',
                    update_select_option5: 'shirt_shoe',
                    update_view_select_option5:'Quần áo - Giày dép',
                    update_select_option6: 'laptop_pc',
                    update_view_select_option6:'Máy tính',
                    update_select_option7: 'another',
                    update_view_select_option7:'khác',
                    old_name: `${results.rows[0].ProName}`
                };
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
            if (results.rows[0].CatID==7){
                var turn1=results.rows[0].FullDes;
                var turn2=turn1.replaceAll("<UL>","");
                var turn3=turn2.replaceAll("</UL>","");
                var turn4=turn3.replaceAll("<LI>","");
                var turn5=turn4.replaceAll("</LI>","");
                var turn6=turn5.replaceAll("<P>","");
                var turn7=turn6.replaceAll("</P>","");
                var turn8=turn7.replaceAll("&nbsp;","");
                var turn9=turn8.replaceAll("<STRONG>","");
                var turn10=turn9.replaceAll("<ul>","");
                var turn11=turn10.replaceAll("<ul>","");
                var turn12=turn11.replaceAll("</ul>","");
                var turn13=turn12.replaceAll("<li>","");
                var turn14=turn13.replaceAll("</li>","");
                var turn15=turn14.replaceAll("</STRONG>","");
                var turn16=turn15.replaceAll("  "," ");
                var turn17=turn16.trim();
                var obj={
                    get_name_update_product: `${results.rows[0].ProName}`,
                    get_tinyDes_update_product:`${results.rows[0].TinyDes}`,
                    get_fullDes_update_product: `${turn17}`,
                    get_price_update_product: `${results.rows[0].Price}`,
                    get_quantity_update_product: `${results.rows[0].Quantity}`,
                    get_linkImg_update_product: `${results.rows[0].LinkImg}`,
                    update_select_option1: 'another',
                    update_view_select_option1:'Khác',
                    update_select_option2: 'book',
                    update_view_select_option2:'Sách',
                    update_select_option3: 'phone',
                    update_view_select_option3:'Điện thoại',
                    update_select_option4: 'camera',
                    update_view_select_option4:'Máy chụp hình',
                    update_select_option5: 'shirt_shoe',
                    update_view_select_option5:'Quần áo - Giày dép',
                    update_select_option6: 'laptop_pc',
                    update_view_select_option6:'Máy tính',
                    update_select_option7: 'jewelry',
                    update_view_select_option7:'Đồ trang sức',
                    old_name: `${results.rows[0].ProName}`
                };
                client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                    if (err) throw err;
                    var msg='';
                    var msg1=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                    for(var i=0;i<results.rows.length;i++){msg=msg+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                    req.flash("list_option_product",`${msg}`);
                    req.flash("list_option_product1",`${msg1}`);
                    req.flash("lll",`<style>.form_update_product{opacity: 1; visibility: visible; z-index: 999; transition: all 0.5s linear;}</style>`);
                    req.flash("sofm",`<style>.container_name_product1,.container_tinyDes_product1,.container_fullDes_product1,.container_price_product1,.input_update_product,.container_quantity_product1,.container_link_img_product1{opacity:1; visibility: visible; display:block}</style>`);
                    res.render('productsview',obj);
                })
            }
        })
    }
    if (req.body.View_Product_All!=undefined){
        client.query(`select count(*) from public."Products"`, (err, results) => {
            if (err) throw err;
            var count_all_product=Number(results.rows[0].count);
            client.query(`select*
             from public."Products" as p, public."Categories" as c
             where p."CatID"=c."CatID"
             order by p."ProID"`, (err, results) => {
            if (err) {
                throw err;
            }
            var msg = '';
            for (var i = 0; i < count_all_product; i++) {
                msg = msg + `<div class="card-item" onclick="handle_click_card_item_all_product()"><form method="post" action="/users/dashboard" class="form_click_all_product_to_buy"><input type="text" class="click_all_product_to_buy" name="click_all_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3><ul><li>${results.rows[i].FullDes}</ul><div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                //msg = msg + `<div class="card-item"><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3><ul><li>${results.rows[i].FullDes}</ul><div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
            }
            client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                if (err) throw err;
                var msg1='';
                var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                req.flash("data_dashboard",`${msg}`);
                req.flash("list_option_product",`${msg1}`);
                req.flash("list_option_product1",`${msg2}`);
                count=0;
                res.redirect('/users/dashboard');
            })
        });
        });
    }
    if (req.body.delete_select_product!=undefined){
        client.query(`delete from public."Products" as a where a."ProID"=${req.body.delete_select_product}`, (err,results) => {
            if (err) throw err;
            client.query(`update public."Products" set "ProID"="ProID"-1 where "ProID">${Number(req.body.delete_select_product)}`, (err,results) => {
                if (err) throw err;
                req.flash("notification",`<div class="notification" onload="handle_onload_notification()">delete_success</div>`);
                res.redirect('/users/dashboard');
            })
        })
    }
    if (req.body.View_Product != undefined) {
        // client.query(`select count(*) from public."Products" as a where a."CatID"=${Number(req.body.View_Product)}`, (err, results) => {
        //     if (err) throw err;
        //     var count_product = Number(results.rows[0].count);
        //     client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=${Number(req.body.View_Product)}`, (err, results) => {
        //         if (err) throw err;
        //         var msg = '';
        //         for (var i = 0; i < count_product; i++) {
        //             msg = msg + `<div class="card-item"><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div></div>`;
        //         }
        //         req.flash("data_dashboard",`${msg}`);
        //         res.redirect('/viewsProduct');
        //     })
        // });
        if(req.body.View_Product=='1'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=1`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=1`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item" onclick="handle_click_card_item_book_product()"><form method="post" action="/users/dashboard" class="form_click_book_product_to_buy"><input type="text" class="click_book_product_to_buy" name="click_book_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3><ul><li>${results.rows[i].FullDes}</ul><div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='2'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=2`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=2`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item" onclick="handle_click_card_item_phone_product()"><form method="post" action="/users/dashboard" class="form_click_phone_product_to_buy"><input type="text" class="click_phone_product_to_buy" name="click_phone_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='3'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=3`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=3`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item"onclick="handle_click_card_item_camera_product()"><form method="post" action="/users/dashboard" class="form_click_camera_product_to_buy"><input type="text" class="click_camera_product_to_buy" name="click_camera_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='4'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=4`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=4`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item"onclick="handle_click_card_item_shirt_shoe_product()"><form method="post" action="/users/dashboard" class="form_click_shirt_shoe_product_to_buy"><input type="text" class="click_shirt_shoe_product_to_buy" name="click_shirt_shoe_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='5'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=5`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=5`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item"onclick="handle_click_card_item_laptop_pc_product()"><form method="post" action="/users/dashboard" class="form_click_laptop_pc_product_to_buy"><input type="text" class="click_laptop_pc_product_to_buy" name="click_laptop_pc_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='6'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=6`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=6`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item"onclick="handle_click_card_item_jewelry_product()"><form method="post" action="/users/dashboard" class="form_click_jewelry_product_to_buy"><input type="text" class="click_jewelry_product_to_buy" name="click_jewelry_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
        else if (req.body.View_Product=='7'){
            client.query(`select count(*) from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=7`, (err,results) => {
                if (err) throw err;
                var count_book_products=Number(results.rows[0].count);
                client.query(`select* from public."Products" as a, public."Categories" as b where a."CatID"=b."CatID" and a."CatID"=7`, (err, results) => {
                    if (err) throw err;
                    var msg=''
                    for(var i=0;i<count_book_products;i++){
                        msg = msg + `<div class="card-item"onclick="handle_click_card_item_another_product()"><form method="post" action="/users/dashboard" class="form_click_another_product_to_buy"><input type="text" class="click_another_product_to_buy" name="click_another_product_to_buy"></form><div class="card-item-img"><img src="${results.rows[i].LinkImg}" alt=""></div><div class="card-item-info"><h3>Tên sản phẩm</h3><ul><li>${results.rows[i].ProName}</ul><h3>Mô tả ngắn gọn:</h3><ul><li>${results.rows[i].TinyDes}</ul><h3>Thông tin chi tiết:</h3>${results.rows[i].FullDes}<div class="price"><h4>Giá tiền:</h4><ul><li>${results.rows[i].Price}₫</ul></div><div class="type"><h4>Loại hàng:</h4><ul><li>${results.rows[i].CatName}<ul></div><div class="quantity"><h4>Số lượng còn lại:</h4><ul><li>${results.rows[i].Quantity}<ul></div></div></div>`;
                    }
                    client.query(`select a."ProName" from public."Products" as a order by a."ProID"`, (err,results) => {
                        if (err) throw err;
                        var msg1='';
                        var msg2=`<option>---Chọn sản phẩm cần cập nhật thông tin---</option>`;
                        for(var i=0;i<results.rows.length;i++){msg2=msg2+`<option value="${i+1}">${results.rows[i].ProName}</option>`;msg1=msg1+`<option value="${i+1}">${results.rows[i].ProName}</option>`;}
                        req.flash("data_dashboard",`${msg}`);
                        req.flash("list_option_product",`${msg1}`);
                        req.flash("list_option_product1",`${msg2}`);
                        count=0;
                        res.redirect('/users/dashboard');
                    })
                })
            })
        }
    }
    if (req.body.add_name_product != undefined) {
        client.query(`SELECT*
        FROM public."Products" as a
        where a."ProName"='${req.body.add_name_product}'`, (err, results) => {
            if (err) throw err;
            if (results.rows.length > 0) {
                req.flash("notification",`<div class="notification" onload="handle_onload_notification()">fail</div>`);
                res.redirect('/users/dashboard');
            }
            else {
                client.query(`SELECT count(a."ProID") FROM public."Products" as a;`, (err, results) => {
                    if (err) throw err;
                    var type;
                    if (req.body.add_select_product == 'book') type = 1;
                    else if (req.body.add_select_product == 'phone') type = 2;
                    else if (req.body.add_select_product == 'camera') type = 3;
                    else if (req.body.add_select_product == 'shirt_shoe') type = 4;
                    else if (req.body.add_select_product == 'laptop_pc') type = 5;
                    else if (req.body.add_select_product == 'jewelry') type = 6;
                    else if (req.body.add_select_product == 'another') type = 7;
                    var a=req.body.add_fullDes_product.replaceAll(".","<li>");
                    var b;
                    if (a[a.length-1]=='>'){
                        var c=a.lastIndexOf('>');
                        b= a.slice(0,c-3);}
                    else b=a;
                    var msg_fullDes = `<ul><li>${b}</ul>`;
                    var msg_fullDes1 = msg_fullDes.replaceAll("<li><li>","<li>");
                    client.query(`insert into public."Products"("ProID", "ProName", "TinyDes", "FullDes", "Price", "CatID", "Quantity", "LinkImg") values(${Number(results.rows[0].count) + 1},'${req.body.add_name_product}', '${req.body.add_tinyDes_product}', '${msg_fullDes1}', ${req.body.add_price_product},${type}, ${req.body.add_quantity_product}, 'http://localhost:3000/${req.file.originalname}')`, (err, results) => {
                        if (err) throw err;
                        req.flash("notification",`<div class="notification" onload="handle_onload_notification()">success</div>`);
                        res.redirect('/users/dashboard');
                    });
                });
            }
        })
    }

});

function checkLogin(req,res,next){
    if (req.user){
        return next();
    }
    res.redirect('/')
}

function redirectToDashboard(req,res,next){
    if (req.user){
        return res.redirect('/users/dashboard');
    }
    next();
}
app.get('/logout', (req, res) =>{
    req.logOut(req.user, (err) => {
        if (err) {
            next(err);
        }
        res.redirect('/');
    });
})
app.use('/:params', (req,res) => {
    res.redirect('/');
});
app.listen(3000);