/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
    AspectRatio,
    Box,
    IconButton,
    Skeleton as ChakraSkeleton,
    Stack,
    Text,
    useMultiStyleConfig
} from '@salesforce/retail-react-app/app/components/shared/ui'
import DynamicImage from '@salesforce/retail-react-app/app/components/dynamic-image'

// Hooks
import {useIntl} from 'react-intl'

// Other
import {productUrlBuilder} from '@salesforce/retail-react-app/app/utils/url'
import Link from '@salesforce/retail-react-app/app/components/link'
import withRegistration from '@salesforce/retail-react-app/app/components/with-registration'
import {useCurrency} from '@salesforce/retail-react-app/app/hooks'

const IconButtonWithRegistration = withRegistration(IconButton)

// Component Skeleton
export const Skeleton = () => {
    const styles = useMultiStyleConfig('ProductTile')
    return (
        <Box data-testid="sf-product-tile-skeleton">
            <Stack spacing={2}>
                <Box {...styles.imageWrapper}>
                    <AspectRatio ratio={1} {...styles.image}>
                        <ChakraSkeleton />
                    </AspectRatio>
                </Box>
                <ChakraSkeleton width="80px" height="20px" />
                <ChakraSkeleton width={{base: '120px', md: '220px'}} height="12px" />
            </Stack>
        </Box>
    )
}

/**
 * The ProductTile is a simple visual representation of a
 * product object. It will show it's default image, name and price.
 * It also supports favourite products, controlled by a heart icon.
 */
const ProductTile = (props) => {
    const intl = useIntl()
    const {
        product,
        dynamicImageProps,
        ...rest
    } = props

    const {currency, image, price, productId, hitType} = product

    // ProductTile is used by two components, RecommendedProducts and ProductList.
    // RecommendedProducts provides a localized product name as `name` and non-localized product
    // name as `productName`. ProductList provides a localized name as `productName` and does not
    // use the `name` property.
    const localizedProductName = product.name ?? product.productName

    const {currency: activeCurrency} = useCurrency()
    const styles = useMultiStyleConfig('ProductTile')

    return (
        <Box {...styles.container}>
            <Link
                data-testid="product-tile"
                to={productUrlBuilder({id: productId}, intl.local)}
                {...styles.link}
                {...rest}
            >
                <Box {...styles.imageWrapper}>
                    {image && (
                        <AspectRatio {...styles.image}>
                            <DynamicImage
                                src={`${image.disBaseLink || image.link}[?sw={width}&q=60]`}
                                widths={dynamicImageProps?.widths}
                                imageProps={{
                                    alt: image.alt,
                                    ...dynamicImageProps?.imageProps
                                }}
                            />
                        </AspectRatio>
                    )}
                </Box>

                {/* Title */}
                <Text {...styles.title}>{localizedProductName}</Text>

                {/* Price */}
                <Text {...styles.price} data-testid="product-tile-price">
                    {hitType === 'set'
                        ? intl.formatMessage(
                            {
                                id: 'product_tile.label.starting_at_price',
                                defaultMessage: 'Starting at {price}'
                            },
                            {
                                price: intl.formatNumber(price, {
                                    style: 'currency',
                                    currency: currency || activeCurrency
                                })
                            }
                        )
                        : intl.formatNumber(price, {
                            style: 'currency',
                            currency: currency || activeCurrency
                        })}
                </Text>
            </Link>
        </Box>
    )
}

ProductTile.displayName = 'ProductTile'

ProductTile.propTypes = {
    /**
     * The product search hit that will be represented in this
     * component.
     */
    product: PropTypes.shape({
        currency: PropTypes.string,
        image: PropTypes.shape({
            alt: PropTypes.string,
            disBaseLink: PropTypes.string,
            link: PropTypes.string
        }),
        price: PropTypes.number,
        // `name` is present and localized when `product` is provided by a RecommendedProducts component
        // (from Shopper Products `getProducts` endpoint), but is not present when `product` is
        // provided by a ProductList component.
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=getProducts
        name: PropTypes.string,
        // `productName` is localized when provided by a ProductList component (from Shopper Search
        // `productSearch` endpoint), but is NOT localized when provided by a RecommendedProducts
        // component (from Einstein Recommendations `getRecommendations` endpoint).
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch
        // See: https://developer.salesforce.com/docs/commerce/einstein-api/references/einstein-api-quick-start-guide?meta=getRecommendations
        // Note: useEinstein() transforms snake_case property names from the API response to camelCase
        productName: PropTypes.string,
        productId: PropTypes.string,
        hitType: PropTypes.string
    }),
    dynamicImageProps: PropTypes.object
}

export default ProductTile
