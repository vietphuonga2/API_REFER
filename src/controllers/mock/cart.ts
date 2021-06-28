export const cart = [
    {
        "id": 1,
        "agent_id": 1,
        "product_price_id": 1,
        "quantity": 10,
        "create_at": "2021-06-08T07:52:09.000Z",
        "update_at": "2021-06-08T07:52:09.000Z",
        "ProductPrice": {
            "product_id": 1,
            "stock_id": 1,
            "level_id": 1,
            "price": 10000,
            "custom_attribute_option_id_1": 1,
            "custom_attribute_option_id_2": 2,
            "status": 1,
            "agent_id": 1,
            "Product": {
                "code": "MACODE",
                "name": "Giày thể thao alphabouce",
                "height": 10.5,
                "width": 10.5,
            },

            "custom_attribute_option_1": { id: 1, "name": "Xanh dương" },
            "custom_attribute_option_2": { id: 2, "name": "L" },
        },
    }
];
export const cart_detail = [
    {
        id: 1,
        name: "Shop giầy Trung Hương",
        Stocks: [
            {
                id: 1, name: "Xưởng giầy thể thao đống đa",
                ProductPrices: [
                    {
                        AgentCart: {
                            id: 1,
                            quantity: 10
                        },
                        "product_id": 1,
                        "stock_id": 1,
                        "level_id": 1,
                        "price": 10000,
                        "discount_price": 9000,
                        "custom_attribute_option_id_1": 1,
                        "custom_attribute_option_id_2": 2,
                        "status": 1,
                        "agent_id": 1,
                        "Product": {
                            id: 1,
                            "code": "MACODE",
                            "name": "Giày thể thao alphabouce",
                            "height": 10.5,
                            "width": 10.5,
                        },

                        "custom_attribute_option_1": { id: 1, "name": "Xanh dương" },
                        "custom_attribute_option_2": { id: 2, "name": "L" },
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        name: "Shop giầy Trung Hương",
        Stocks: [
            {
                id: 2, name: "Xưởng giầy thể thao đống đa",
                ProductPrices: [
                    {
                        AgentCart: {
                            id: 2,
                            quantity: 20
                        },
                        "product_id": 2,
                        "stock_id": 1,
                        "level_id": 1,
                        "price": 10000,
                        "discount_price": 9000,
                        "custom_attribute_option_id_1": 1,
                        "custom_attribute_option_id_2": 2,
                        "status": 1,
                        "agent_id": 1,
                        "Product": {
                            id: 2,
                            "code": "MACODE",
                            "name": "Giày thể thao alphabouce",
                            "height": 10.5,
                            "width": 10.5,
                        },

                        "custom_attribute_option_1": { id: 3, "name": "Xanh dương" },
                        "custom_attribute_option_2": { id: 4, "name": "L" },
                    }
                ]
            }
        ]
    },
    // {
    //     "id": 1,
    //     "agent_id": 1,
    //     "product_price_id": 1,
    //     "quantity": 10,
    //     "create_at": "2021-06-08T07:52:09.000Z",
    //     "update_at": "2021-06-08T07:52:09.000Z",
    //     "ProductPrice": {
    //         "product_id": 1,
    //         "stock_id": 1,
    //         "level_id": 1,
    //         "price": 10000,
    //         "discount_price": 9000,
    //         "custom_attribute_option_id_1": 1,
    //         "custom_attribute_option_id_2": 2,
    //         "status": 1,
    //         "agent_id": 1,
    //         "Product": {
    //             "code": "MACODE",
    //             "name": "Test",
    //             "weight": 10.5,
    //             "width": 10.5,
    //         },

    //         "ProductAttributeName1": { id: 1, "name": "TESTNEW_1" },
    //         "ProductAttributeName2": { id: 2, "name": "TESTNEW_2" },
    //     },
    // },
    // {
    //     "id": 2,
    //     "agent_id": 2,
    //     "product_price_id": 2,
    //     "quantity": 11,
    //     "create_at": "2021-06-08T07:52:09.000Z",
    //     "update_at": "2021-06-08T07:52:09.000Z",
    //     "ProductPrice": {
    //         "product_id": 2,
    //         "stock_id": 2,
    //         "level_id": 2,
    //         "price": 20000,
    //         "custom_attribute_option_id_1": 1,
    //         "custom_attribute_option_id_2": 2,
    //         "status": 1,
    //         "agent_id": 2,
    //         "Product": {
    //             "code": "MACODE",
    //             "name": "Test",
    //             "weight": 11.5,
    //             "width": 11.5,
    //         },

    //         "ProductAttributeName1": { "name": "TESTNEW_3" },
    //         "ProductAttributeName2": { "name": "TESTNEW_4" },
    //     },
    // }
];