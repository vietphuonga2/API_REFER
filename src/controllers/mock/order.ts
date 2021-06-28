export const order_detail = [
    {
        "id": 1,
        "customer_id": 1,
        "enterprise_id": 1,
        "agent_id": 1,
        "ship_merchan_id": 1,
        "type_payment_id": 1,// 1: chuyển khoản||2: thanh toán khi nhận hàng
        "total_money": 1000000,//tổng tiền
        "count_item": 3,//số lượng sản phẩm
        "status_payment": {
            "id": 1,
            "name": "Đã thanh toán"
        },
        "status_order": {
            "id": 2,
            "name": "Hoàn thành"
        },
        "status_ship": {
            "id": 3,
            "name": "Đã giao"
        },
        "create_at": "2021-06-08T07:52:09.000Z",
        "update_at": "2021-06-08T07:52:09.000Z",
        "OrderItems": [
            {
                "id": 1,
                "order_id": 1,
                "product_id": 1,
                "quantity": 1,
                "agent_price": 900000,
                "discount_price": 800000,
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE",
                    "name": "Test",
                    "weight": 10.5,
                    "width": 10.5,
                },

            },
            {
                "id": 2,
                "order_id": 2,
                "product_id": 2,
                "quantity": 2,
                "agent_price": 920000,
                "discount_price": 820000,
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE_1",
                    "name": "Test_1",
                    "weight": 11.5,
                    "width": 11.5,
                },

            }
        ],
        "Customer": {
            "id": 1,
            "name": "Nguyễn Văn A",
            "phone": "0963258741",
            "df_province": {
                "id": 1,
                "name": "Hà Nội"
            },
            "df_district": {
                "id": 1,
                "name": "Thanh Xuân"
            },
            "df_wards_id": {
                "id": 1,
                "name": "Số 2 Kim Giang"
            },
            "address": "99 Kim Giang, Thanh Xuân, Hà Nội",
            "location_address": "99 Kim Giang, Thanh Xuân, Hà Nội",
            "lat": null,
            "long": null,
        },
        "Ship": {
            "id": 1,
            "name": "Giao hàng nhanh",
            "ship_fee": "12000",
        },
        "df_type_payment": {
            "id": 1,
            "name": "Ngân lượng",
            "value": 1,// 1: Chuyển khoản || 2: cod || 3: online
        }
    }
]
export const order = [
    {
        "id": 1,
        "customer_id": 1,
        "enterprise_id": 1,
        "agent_id": 1,
        "ship_merchan_id": 1,
        "total_money": 1000000,//tổng tiền
        "count_item": 3,//số lượng sản phẩm
        "status_payment": {
            "id": 1,
            "name": ""
        },
        "status_order": {
            "id": 2,
            "name": ""
        },
        "status_ship": {
            "id": 3,
            "name": ""
        },
        "create_at": "2021-06-08T07:52:09.000Z",
        "update_at": "2021-06-08T07:52:09.000Z",
        "OrderItems": [
            {
                "id": 1,
                "order_id": 1,
                "product_id": 1,
                "quantity": 1,
                "agent_price": 900000,//giá bán
                "discount_price": 800000,//giá triết khấu
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE",
                    "name": "Test",
                    "weight": 10.5,
                    "width": 10.5,
                },
            },
            {
                "id": 2,
                "order_id": 2,
                "product_id": 2,
                "quantity": 2,
                "agent_price": 920000,
                "discount_price": 820000,
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE_1",
                    "name": "Test_1",
                    "weight": 11.5,
                    "width": 11.5,
                },

            }
        ]
    },
    {
        "id": 2,
        "customer_id": 2,
        "enterprise_id": 2,
        "agent_id": 2,
        "ship_merchan_id": 2,
        "total_money": 2000000,//tổng tiền
        "count_item": 2,//số lượng sản phẩm
        "status_payment": {
            "id": 1,
            "name": ""
        },
        "status_order": {
            "id": 2,
            "name": ""
        },
        "status_ship": {
            "id": 3,
            "name": ""
        },
        "create_at": "2021-06-08T07:52:09.000Z",
        "update_at": "2021-06-08T07:52:09.000Z",
        "OrderItems": [
            {
                "id": 2,
                "order_id": 2,
                "product_id": 2,
                "quantity": 2,
                "agent_price": 1000000,//giá bán
                "discount_price": 900000,//giá triết khấu
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE",
                    "name": "Test",
                    "weight": 11.5,
                    "width": 11.5,
                },
            },
            {
                "id": 2,
                "order_id": 2,
                "product_id": 2,
                "quantity": 2,
                "agent_price": 920000,
                "discount_price": 820000,
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE_1",
                    "name": "Test_1",
                    "weight": 11.5,
                    "width": 11.5,
                },

            }
        ]
    },
]
export const createOrder = [
    {
        "id": 1,
        "customer_id": 1,
        "enterprise_id": 1,
        "agent_id": 1,
        "ship_merchan_id": 1,
        "total_money": 1000000,//tổng tiền
        "count_item": 3,//số lượng sản phẩm
        "status_payment": {
            "id": 1,
            "name": ""
        },
        "status_order": {
            "id": 2,
            "name": ""
        },
        "status_ship": {
            "id": 3,
            "name": ""
        },
        "create_at": "2021-06-08T07:52:09.000Z",
        "update_at": "2021-06-08T07:52:09.000Z",
        "OrderItems": [
            {
                "id": 1,
                "order_id": 1,
                "product_id": 1,
                "quantity": 1,
                "agent_price": 900000,//giá bán
                "discount_price": 800000,//giá triết khấu
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE",
                    "name": "Test",
                },
            },
            {
                "id": 2,
                "order_id": 2,
                "product_id": 2,
                "quantity": 2,
                "agent_price": 920000,
                "discount_price": 820000,
                "product": {
                    "custom_attribute_option_1": {
                        "id": 1,
                        "name": "Đỏ"
                    },
                    "custom_attribute_option_2": {
                        "id": 2,
                        "name": "40"
                    },
                    "code": "MACODE_1",
                    "name": "Test_1",
                    "weight": 11.5,
                    "width": 11.5,
                },

            }
        ]
    }
]


export const updateOrder = {
    "code": "#111",
    "customer_id": 5,
    "enterprise_id": 13,
    "ship_merchant_id": 1,
    "agent_id": 70,
    "count_item": 2,
    "total_money": 12300,
    "status_payment_id": 1,
    "status_order_id": 1,
    "status_ship_id": 1,
    "type_payment_id": 1,
    "type_ship": 1,
    "ship_fee": 3210,
    "price": 12300,
    "note": "xxx hehe",
    "commission": "alo kaka commission",
    "OrderItems": [
        {
            "product_id": 2,
            "price": 1200,
            "agent_price": 1250,
            "discount_price": 1300,
            "product": {
                "code": "MACODE_1",
                "name": "p1",
                "width": 11.5,
                "weight": 11.5,
                "custom_attribute_option_1": {
                    "id": 1,
                    "name": "Đỏ"
                },
                "custom_attribute_option_2": {
                    "id": 2,
                    "name": "40"
                }
            },
            "quantity": 10
        },
        {
            "product_id": 5,
            "price": 1000,
            "agent_price": 1200,
            "discount_price": 1300,
            "product": {
                "code": "LOALG",
                "name": "Loa Bluetooth Di Động LG Xboomgo PL2",
                "width": 10,
                "weight": 20,
                "custom_attribute_option_1": {
                    "id": 1,
                    "name": "Đỏ"
                },
                "custom_attribute_option_2": {
                    "id": 2,
                    "name": "40"
                }
            },
            "quantity": 5
        }
    ]
}