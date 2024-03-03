function errorHandler(err, req, res, next) {
    let status = 500
    let msg = "Internal Server Error"
    if (err.name === "Validate Email") {
        status = 400
        msg = "Paramter email tidak sesuai format"
    } else if (err.name === "Email already taken") {
        status = 400
        msg = err.name
    } else if (err.name === "Minimum password 8") {
        status = 400
        msg = "Minimum length password is 8"
    } else if (err.name === "Username atau password salah") {
        status = 400
        msg = "Username atau password salah"
    } else if (err.name === "Token tidak tidak valid atau kadaluwarsa") {
        status = 400
        msg = "Token tidak tidak valid atau kadaluwarsa"
    } else if (err.name === "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0") {
        status = 400
        msg = "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0"
    } else if (err.name === "User not found") {
        status = 400
        msg = "User not found"
    } else if (err.name === "Parameter service_code harus di isi") {
        status = 400
        msg = "Parameter service_code harus di isi"
    } else if (err.name === "Service atau Layanan tidak ditemukan") {
        status = 400
        msg = "Service atau Layanan tidak ditemukan"
    } else if (err.name === "Saldo tidak mencukupi") {
        status = 400
        msg = err.name
    }
    return res.status(status).json({ status: 102, message: msg, data: null });
}

module.exports = errorHandler