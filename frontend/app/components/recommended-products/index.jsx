/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import ProductScroller from '@salesforce/retail-react-app/app/components/product-scroller'
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'
import {useCurrentCustomer} from '@salesforce/retail-react-app/app/hooks/use-current-customer'
import useIntersectionObserver from '@salesforce/retail-react-app/app/hooks/use-intersection-observer'

import {useToast} from '@salesforce/retail-react-app/app/hooks/use-toast'
import useNavigation from '@salesforce/retail-react-app/app/hooks/use-navigation'
import {useShopperCustomersMutation} from '@salesforce/commerce-sdk-react'

/**
 * A component for fetching and rendering product recommendations from the Einstein API
 * by a zone or a recommender name.
 */
const RecommendedProducts = ({zone, recommender, products, title, shouldFetch, ...props}) => {
    const {
        isLoading,
        recommendations,
        getZoneRecommendations,
        getRecommendations,
        sendClickReco,
        sendViewReco
    } = useEinstein()
    const ref = useRef()
    const isOnScreen = useIntersectionObserver(ref, {useOnce: true})
    const [_products, setProducts] = useState(products)

    useEffect(() => {
        // Check if the component should fetch results or not. This is useful
        // when you are still waiting on additional data, like `products`.
        if (typeof shouldFetch === 'function' && !shouldFetch()) {
            return
        }

        // Fetch either zone or recommender, but not both. If a zone and recommender
        // name are both provided, `zone` takes precendence.
        if (zone) {
            getZoneRecommendations(zone, _products)
            return
        }
        if (recommender) {
            getRecommendations(recommender, _products)
            return
        }
    }, [zone, recommender, _products])

    useEffect(() => {
        // This is an optimization that eliminates superfluous rerenders/fetching by
        // keeping a copy of the `products` array prop in state for shallow comparison.
        if (!Array.isArray(products)) {
            return
        }
        if (
            products.length !== _products?.length ||
            !products.every((val, index) => val === _products?.[index])
        ) {
            setProducts(products)
        }
    }, [products])

    useEffect(() => {
        if (isOnScreen && recommendations?.recs) {
            sendViewReco(
                {
                    recommenderName: recommendations.recommenderName,
                    __recoUUID: recommendations.recoUUID
                },
                recommendations.recs.map((rec) => ({id: rec.id}))
            )
        }
    }, [isOnScreen, recommendations])

    // The component should remove itself altogether if it has no recommendations
    // and we aren't loading any.
    if (!isLoading && (!recommendations || recommendations.length < 1)) {
        return null
    }

    return (
        <ProductScroller
            ref={ref}
            title={title || recommendations?.displayMessage}
            products={recommendations.recs}
            isLoading={isLoading}
            productTileProps={(product) => ({
                onClick: () => {
                    sendClickReco(
                        {
                            recommenderName: recommendations.recommenderName,
                            __recoUUID: recommendations.recoUUID
                        },
                        product
                    )
                }
            })}
            {...props}
        />
    )
}

RecommendedProducts.propTypes = {
    /* The title to appear above the product scroller */
    title: PropTypes.any,

    /* The zone to request */
    zone: PropTypes.string,

    /* The recommender to request */
    recommender: PropTypes.string,

    /* The products to use for recommendation context */
    products: PropTypes.arrayOf(PropTypes.object),

    /* Callback to determine if the component should fetch results */
    shouldFetch: PropTypes.func
}

export default RecommendedProducts
