// Cấu hình Firebase của ứng dụng web
// Đối với SDK Firebase JS v7.20.0 trở lên, measurementId là tùy chọn
var firebaseConfig = {
    apiKey: "AIzaSyCOTFPO_QudNlI29KUwxO9mi89QXJtu4yg",
    authDomain: "duan-99.firebaseapp.com",
    databaseURL: "https://duan-99.firebaseio.com",
    projectId: "duan-99",
    storageBucket: "duan-99.appspot.com",
    messagingSenderId: "149917415222",
    appId: "1:149917415222:web:d784a7a95abd97df776597",
    measurementId: "G-9CNRKT6LMD"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
// Phần đăng nhập
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  // Người dùng đã đăng nhập.
	  var user = firebase.auth().currentUser;
	  if(!window.location.href.includes("admin_dashboard")){ // Kiểm tra nếu ko phải là trang admin thì chuyển sang trang admin
		if(user.uid == "mqaF9FZzpCPlVXk4H0OT5DXc0pb2") {
		  if(user != null){
			  location.replace("admin_dashboard.html");
			  alert("Đăng nhập thành công.");
		  }
		}
		else {
		  var email_id = user.email; //Lấy tên tài khoản
		  document.getElementById("user_para").innerHTML = "Tài khoản '" + email_id + "' chưa có dữ iệu trên máy chủ.";
		  document.getElementById("user_div").style.display = "block";
		  document.getElementById("login_div").style.display = "none";
		}
	  }
	} else {
	  // Không có người dùng nào đăng nhập.
	  if(!window.location.href.includes("index")){ // Kiểm tra nếu ko phải là trang chủ thì thông báo rồi chuyển sang trang chủ
		//alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập vào Bảng điều khiển.");
		location.replace("index.html");
	  } else {
		document.getElementById("user_div").style.display = "none";
		document.getElementById("login_div").style.display = "block";
	  }
	}
});
function login(){
	var userEmail = document.getElementById("email_field").value;
	var userPass = document.getElementById("password_field").value;
	firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
	  // Đăng nhập thất bại.
	  var errorCode = error.code; // Lấy mã thông báo rồi so sánh để đưa ra thông báo
	  var error1 = "auth/invalid-email"
	  var error2 = "auth/user-not-found"
	  var error3 = "auth/wrong-password"
	  if(errorCode == error1){
		window.alert("Sai định dạng email.");
	  } else if(errorCode == error2){
		window.alert("Tài khoản chưa được đăng ký.");
	  } else if(errorCode == error3){
		window.alert("Sai mật khẩu.");
	  }
	});
}
function logout(){
  firebase.auth().signOut().then(function(){
	if(!window.location.href.includes("index")){ // Kiểm tra nếu ko phải là trang chủ thì chuyển sang trang chủ
		location.replace("index.html");
	}
	window.alert("Đã đăng xuất.");
  }).catch(function(){
	console.log("Lỗi hàm logout.")
  });
}