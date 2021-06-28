export const IS_ACTIVE = {
  ACTIVE: 1,
  INACTIVE: 0,
};
export const IS_READ = {
  ACTIVE: 1, // chưa đọc
  INACTIVE: 0, // đã đọc
};

export const ONESIGNAL = {
  APP_ID: 'c8b8dd42-aaae-4a15-8796-73ec789bacc5',
  AUTHORIZATION: 'NzI4ODMyYTEtOTQyMi00NWMwLThhYmYtNDdjYzljMjc5YTM0',
  ANDROID_CHANNEL_ID: '84284e1b-548c-40e4-805c-08f7edc83c71',
};

export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const FILTER_TYPE = {
  PRICE_MIN_MAX: 2, // Giá từ thấp đến cao
  PRICE_MAX_MIN: 1, // Giá từ cao đến thấp
  TIME_NEW_OLD: 1, // Tin đăng mới nhất
  TIME_OLE_NEW: 2, // Tin đăng cũ nhất
};
export const UNIT_SIPPING = {
  GHN: 1,
  GHTK: 2,
};
export const SHIPPING_TYPE = {
  VC: 1, //  vận chuyển
  KVC: 0, // không vận chuyển
};
export const CATEGORY_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const ENTERPRISE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const AGENT_ENTERPRISE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};
export const PRODUCT_STATUS = {
  ACTIVE: 1, // tạo thành công
  PENDING: 2, // đang khởi tạo
  INACTIVE: 0, //  dừng hoạt động
};

export const PRODUCT_PRICE_STATUS = {
  OUT_OF_STOCK: 0,
  AVAILABLE: 1,
};

export const BANNER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const PRODUCT_MEDIA_TYPE = {
  IMAGE: 1,
  VIDEO: 2,
};

export const PLACE_TYPES = {
  PROVINCE: 'region',
  DISTRICT: 'locality',
  WARD: 'extended-address',
};
export const GOOGLE_API_KEY = 'AIzaSyAWWFzb1uMxLnm_DaD0ZVfZXrBzeEfrJTM';

export const PRODUCT_ORDER_TYPE = {
  ONLINE: 1,
  CONTACT: 2,
};
export const STOKE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const TRANSACTION_MODE = {
  SUBTRACT: -1,
  PLUS: 1,
};
export const GENDER = {
  MALE: 1,
  FEMALE: 2,
};

export const PACKAGE_TYPE = {
  SOFTWARE: 1,
  TRANSACTION: 2,
};

export const AGENT_TYPE = {
  FREE: 0,
  CONTRACT: 1,
};

export const PAYMENT_TYPE = {
  CASH: 1,
  TRANSFER: 2,
};

export const BANNER_TYPE = {
  NORMAL: 1,
  RECRUIT: 2,
};

export const SALE_TYPE = {
  WHOLESALE: 1,
  RETAIL: 2,
  RETURN: 3,
};

export const VOUCHER = {
  RECEIPT: 1,
  PAYMENT: 2,
};

export const INVOICE_OBJECT = {
  CUSTOMER: 1,
  SUPPLIER: 2,
};

export const ROLE = {
  ADMIN: 1,
  ENTERPRISE: 2,
  AGENT: 3,
};

// Đây là các loại user mà không được xử lý data trực tiếp trong user controller
export const USER_TYPE = {
  // ADMIN: 1,
  ENTERPRISE: 2,
  AGENT: 3,
};

export const ORDER_HISTORY_UPDATE_TYPE = {
  DEFAULT: 0, // mac dinh
  EDIT_ORDER: 1, // sua don hang
  IGNORE_ORDER: 2, // huy don hang
  COMPLETED_ORDER: 3, // hoàn thành
};

export const ORDER_STATUS_TYPE = {
  // NEED_CONFIRM: {
  //   id: 1,
  //   name: 'Cần xác nhận',
  // },
  // WAIT_ENTERPRISE_CONFIRMED: {
  //   id: 2,
  //   name: 'Chờ NCC xác nhận',
  // },
  // CONFIRMED: {
  //   id: 3,
  //   name: 'Đã xác nhận',
  // },
  // DELIVERING: {
  //   id: 4,
  //   name: 'Đang giao hàng',
  // },
  // HISTORY: {
  //   id: 5,
  //   name: 'Lịch sử',
  // },
  NEED_CONFIRM_ORDER: 1, // can xac nhan
  WAIT_ENTERPRISE_CONFIRMED_ORDER: 2, // doi ncc xac nhan
  CONFIRMED_ORDER: 3, // da xac nhan
  DELIVERING_ORDER: 4, // dang giao
  HISTORY_ORDER: 5, // lich su don hang
  CANCEL_ORDER: 6, // don hang da huy
};

export const ROLE_NAMES = {
  ADMIN: 'admin',
  ENTERPRISE: 'enterprise',
  AGENT: 'agent',
};

export const PRODUCT_ATTRIBUTE_TYPE = {
  TEXT: 1,
  SELECT: 2,
  MULTISELECT: 3,
  DATE: 4,
  NUMBER: 5,
};

export const TRANSACTION_TYPE = {
  RECEIVE_GOODS: 1,
  SALE_GOODS_WHOLESALE: 2,
  SALE_GOODS_RETAIL: 3,
  RETURN_GOODS: 4,
  INVOICE_RECEIPT: 5,
  INVOICE_PAYMENT: 6,
};

export const DEFAULT_CONFIG = {
  PASSWORD: 1,
};

export const CONFIG = {
  DATE_FORMAT: 'YYYY-DD-MM-DD',
  CRYPT_SALT: 10,
  PAGING_LIMIT: 24,
  RESET_PASSWORD: 'Base123a@',
  MAX_IMAGE: 5,
  OTP_FAIL_COUNT: 3,
  EXP_OTP: 60,
  EXP_PASSWORD: 60,
  HOT_LINE: '0394202944',
  LOGIN_FAIL_COUNT: 4,
  LIMIT_POST_ECOMMERCE: 5,
  LIMIT_SIMILAR_PRODUCT: 5,
  LIMIT_POST_HISTORY: 10,
  INTRODUCTION_F1: 'HOA_HONG_F1',
  INTRODUCTION_F2: 'HOA_HONG_F2',
};

export class AppError extends Error {
  code: number;

  constructor(err: { code: number; message: string }) {
    super(err.message);
    this.code = err.code;
  }

  public with(message: string): AppError {
    this.message = message;
    return this;
  }
}

export const apiCode = {
  SUCCESS: { code: 1, message: 'Thành công' },
  DB_ERROR: { code: 2, message: 'Truy vấn lỗi' },
  OTP_FAIL: { code: 3, message: 'OTP không chính xác' },
  DELETE_IMAGE_ERROR: { code: 4, message: 'Lỗi xoá ảnh' },
  ACCOUNT_EXIST: { code: 5, message: 'Tài khoản đã tồn tại' },
  CATEGORY_EXIST: { code: 40, message: 'Tên danh mục đã tồn tại' },
  LEVEL_EXIST: { code: 40, message: 'Tên level đã tồn tại' },
  CATEGORY_NOT_EXIST: { code: 40, message: 'Danh mục không tồn tại' },
  CATEGORY_PARENT_NOT_EXIST: { code: 50, message: 'Danh mục cha đã tồn tại danh mục con' },
  ATRRIBUTE_NOT_EXIST: { code: 40, message: 'Thuộc tính không tồn tại' },
  CATEGORY_ERROR: { code: 40, message: 'Danh mục đã tồn tại' },
  ACCOUNT_NOTFOUND: { code: 5, message: 'Tài khoản đã tồn tại' },
  SERVICE_EXIST: { code: 5, message: 'Dịch vụ đã tồn tại' },
  LOGIN_FAIL: { code: 6, message: 'Sai tài khoản hoặc mật khẩu' },
  LOCK_ACCOUNT: { code: 7, message: 'Tài khoản của bạn đã khóa ' },
  OTP_FAIL_OVER: {
    code: 8,
    message: 'Bạn đã gửi OTP quá số lần cho phép vui lòng thử lại sau 24h',
  },
  INVALID_PARAM: { code: 9, message: 'Tham số không hợp lệ' },
  EXP_OTP: { code: 10, message: 'OTP hết hiệu lực' },
  NOT_FOUND: { code: 11, message: 'Dữ liệu không tồn tại ' },
  STOKE_NOT_FOUND: { code: 42, message: 'Địa chỉ bạn thêm đã tồn tại ' },
  NOT_DELETE_CATEGORY_UCONNECT: {
    code: 11,
    message: 'Không được phép xóa danh mục',
  },
  DATA_EXIST: { code: 11, message: 'Dữ liệu đã tồn tại' },
  FB_ERROR: { code: 12, message: '' },
  UNAUTHORIZED: { code: 403, message: 'Không có quyền truy cập' },
  INVALID_ACCESS_TOKEN: { code: 403, message: 'Vui lòng đăng nhập' },
  NO_PERMISSION: { code: 13, message: 'Không có quyền thực hiện chức năng' },
  ACCOUNT_NOT_EXIST: { code: 14, message: 'Tài khoản không tồn tại' },
  UPDATE_USER_ERROR: { code: 15, message: 'Lỗi cập nhật tài khoản' },
  PAGE_ERROR: { code: 16, message: 'Lỗi truyền trang' },
  NOT_DELETE_SUPER_ADMIN: { code: 17, message: 'Không thế xóa super admin' },
  UPDATE_FAIL: { code: 18, message: 'Cập nhật không thành công' },
  DATA_NOT_EXIST: { code: 19, message: 'Dữ liệu không tồn tại' },
  AGENT_PRODUCT_NOT_EXIST: { code: 44, message: 'Không tồn tại sản phẩm mà bạn đã đăng kí' },
  PRODUCT_NOT_EXIST: { code: 19, message: 'Sản phẩm không tồn tại' },
  ORDER_NOT_EXIST: { code: 19, message: 'Đơn hàng không tồn tại' },
  OFFER_NOT_EXIST: { code: 19, message: 'Đơn hàng không phải của bạn!' },
  PASSWORD_FAIL: { code: 20, message: 'Mật khẩu không chính xác' },
  UPLOAD_FAILED: { code: 21, message: 'Upload thất bại' },
  CATEGORY_NOT_FOUND: { code: 22, message: 'Danh mục không tồn tại ' },
  EXIST_OWNER: {
    code: 22,
    message: 'Bạn không thể thực hiện yêu cầu này do hồ sơ của bạn chưa được duyệt',
  },
  EXIST_TEAM_OWNER: {
    code: 36,
    message: 'Bạn không thể thực hiện yêu cầu này do hồ sơ chủ đội xe của bạn chưa được duyệt',
  },

  LOGIN_FAIL_OVER: {
    code: 23,
    message: 'Bạn đã đăng nhập sai quá số lần cho phép vui lòng thử lại sau 24h',
  },
  PRICE_OFFER_EXIST: { code: 24, message: 'Bạn đã báo giá cho đơn hàng này' },
  STOPPED_PRICE_OFFER: { code: 25, message: 'Đơn hàng đã ngừng nhận báo giá' },
  REQUEST_ACCEPTED: {
    code: 26,
    message: 'Yêu cầu đã được duyệt không thể thay đổi trạng thái',
  },
  TEAM_OWNER_EXIST_IN_PROJECT: {
    code: 27,
    message: 'Chủ đội xe đã tồn tại trong dự án',
  },
  UNFINISHED_PROFILE: {
    code: 28,
    message: 'Mời hoàn thành hồ sơ để thực hiện yêu cầu',
  },
  BRAND_NEW_VEHICLE_EXIST: {
    code: 29,
    message: 'Mã xe đã tồn tại vui lòng thử lại',
  },
  VEHICLE_CATEGORY_EXIST: {
    code: 29,
    message: 'Đã tồn tại loại xe này trong hệ thống.',
  },
  VEHICLE_BRAND_EXIST: {
    code: 29,
    message: 'Đã tồn tại hãng xe này trong hệ thống.',
  },
  INVALID_FILE: { code: 9, message: 'File không hợp lệ' },
  ERROR_BRAND: { code: 30, message: 'Đã tồn tại xe trong hãng xe' },
  ERROR_CATEGORY: { code: 30, message: 'Đã tồn tại xe trong danh mục xe' },
  ERROR_PRODUCT: { code: 30, message: 'Đã tồn tại sản phẩm trong danh mục' },
  PRODUCT_CATEGORY_EXISTS: {
    code: 30,
    message: 'Danh mục sản phẩm đã tồn tại',
  },
  STORE_EXISTS: { code: 30, message: 'Kho hàng đã tồn tại' },
  PRODUCT_EXISTS: { code: 30, message: 'Sản phẩm đã tồn tại' },
  INSURANCE_EXISTS: { code: 30, message: 'Bảo hiểm đã tồn tại' },
  PRODUCT_CART_EXISTS: {
    code: 30,
    message: 'Sản phẩm đã tồn tại trong giỏ hàng',
  },
  INVALID_PLACE: { code: 9, message: 'Địa chỉ không hợp lệ' },
  PRODUCT_NOT_EXISTS: { code: 9, message: 'Sản phầm không tồn tại' },
  VEHICLE_CATEGORY_ERROR: { code: 31, message: 'Loại xe không tồn tại' },
  VEHICLE_BRAND_ERROR: { code: 32, message: 'Hãng xe không tồn tại' },
  PROFILE_ERROR: {
    code: 33,
    message: 'Trong danh sách lựa chọn đã có hồ sơ chấp nhận hoặc từ chối',
  },
  RATE_ERROR: { code: 34, message: 'Bạn đã đánh giá bài viết này rồi' },
  ERROR_TIMEOUT: {
    code: 35,
    message: 'Thời gian cập nhật nhập mật khẩu mới đã hết',
  },
  ERROR_REPORT_TEAM_OWNER: {
    code: 40,
    message: 'Bạn đã báo xấu chủ đội xe rồi',
  },
  ERROR_REPORT_PROJECT_OWNER: {
    code: 41,
    message: 'Bạn đã báo xấu chủ dự án rồi',
  },
  USERNAME_EXIST: { code: 42, message: 'Tên tài khoản đã tồn tại ' },
  PHONE_EXIST: { code: 43, message: 'Số điện thoại đã tồn tại ' },
  PROFILE_EXIST: { code: 44, message: 'Vui lòng nhập đầy đủ thông tin ' },
  PRODUCT_SHIPPING: { code: 45, message: 'Các thông số vận chuyển phải nằm trong koangr từ 0 đến 5.000.000 ' },
  UNIT_SIPPING_EXITS: { code: 46, message: 'Bạn phải lựa chọn đơn vị vận chuyển ' },
  REGISTER_PRODUCT_EXITS: { code: 47, message: 'Bạn đã đăng kí sản phẩm này ' },
  REASON_AGENT_EXITS: { code: 48, message: 'Đại lý này không tồn tại ' },
  REVIEW_EXIT: { code: 49, message: 'Đơn hàng đã được đánh giá' },
  SHIP_MERCHANT_EXIT: { code: 50, message: 'Đơn vị ship bạn chọn không tồn tại' },
};

let SERVER_URL = '';
export function updateServerUrl(request): string {
  SERVER_URL = `${request.protocol}://${request.headers.host}`;
  return SERVER_URL;
}

export function getServerUrl(): string {
  return SERVER_URL;
}

export function getFullUrl(path?: string): string {
  if (!path) {
    return null;
  }

  if (!path.startsWith('http')) {
    return `${SERVER_URL}/${path}`;
  }
  return path;
}
