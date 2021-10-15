// @ts-nocheck
import { MoveButton, PinButton } from './shablack/PinButton';
import React, { useState, useContext, useEffect } from 'react';

import { Gif } from '@giphy/react-components';
import { IGif } from '@giphy/js-types';
import { Paper, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDrag } from 'react-dnd';
import {
	IOrder,
	IWaterfallMessage,
	IHorse,
	IPlaylist,
	PanelItemEnum,
	newPanelTypes
} from '../types';
import { Order } from './NFT/Order';
import { CustomToken as NFT } from '../typechain/CustomToken';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { Map } from './Maps';
import { Tweet } from 'react-twitter-widgets';
import { WaterfallChat } from './WaterfallChat';
import { MusicPlayer } from './MusicPlayer';
import ReactPlayer from 'react-player';
import { AppStateContext } from '../contexts/AppStateContext';
import { Horse } from './Horse';
import confetti from 'canvas-confetti';
import { TezosToolkit, OpKind, MichelsonMap } from '@taquito/taquito'
import {
    BeaconWallet,
    BeaconWalletNotInitialized,
  } from '@taquito/beacon-wallet'
import {useLocation} from 'react-router-dom'
import { XYCoord, useDrop } from 'react-dnd';

const _ = require("lodash"); 
const Tezos = new TezosToolkit('https://mainnet.api.tez.ie')
const wallet = new BeaconWallet({
  name: 'hicetnunc.xyz',
  preferblackNetwork: 'mainnet',
})
Tezos.setWalletProvider(wallet)
const  v2 = 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn';

const useStyles = makeStyles({
	container: {
		position: 'absolute',
		zIndex: 9999995,
		userSelect: 'none',
		display: 'flex'
	},
	paper: {
		padding: 0,
	},
	buttonList: {
		display: 'flex',
		flexDirection: 'column'
	},
	text: {
		padding: 5,
		display: 'flex',
		justifyContent: 'center',
		whiteSpace: 'pre-line', //allows it to display multiple lines!,
		color: "black",
		backgroundColor: "white",
		fontFamily: 'poxel-font',
	},
	button: {
		color: "black",
		fontFamily: 'poxel-font',
	},

    buttonLarge: {
		color: "black",
		fontFamily: 'poxel-font',
        fontSize: 20
	},

    buttonBuy: {
		color: "black",
		fontFamily: 'poxel-font',
        fontSize: 20
	},

	buttonGate: {
		color: "black",
		backgroundColor: "white",
		fontFamily: 'poxel-font',
        fontSize: 20,
	},
	buttonGateBottom: {
		color: "black",
		backgroundColor: "white",
		fontFamily: 'poxel-font',
        fontSize: 20,
		transform: "rotate(180deg)"
	}
});

interface BoardObjectProps {
	id: string;
	type:
	| 'horse'
	| 'objkt'
	| 'objktHistory'
	| 'gif'
	| 'image'
	| 'video'
	| 'text'
	| 'NFT'
	| 'map'
	| 'chat'
	| 'musicPlayer'
	| 'race'
	| 'gate'
	| 'trash'
	| 'bgHolder'
	| 'tweet';
	data?: IGif;
	imgSrc?: string;
	text?: string;

	onPin: () => void;
	onUnpin: () => void;
	setPinnedVideoId?: (id: string) => void;

	top: number;
	left: number;

	isPinnedPlaying?: boolean;
	pinnedVideoId?: string;
	isPinned?: boolean;
	order?: IOrder;

	addNewContract?: (nftAddress: string) => Promise<NFT | undefined>;

	onBuy?: (nftId: string) => void;
	onCancel?: (nftId: string) => void;

	setActivePanel?: (panel: newPanelTypes) => void;
	updateSelectedPanelItem?: (panelItem: PanelItemEnum | undefined) => void;
	chat?: IWaterfallMessage[];
	horseData?: IHorse;
	playlist?: IPlaylist[];

	raceId?: string;

	objktId?: string;
	activeAddress?: string;

	routeRoom?: (roomName: string) => void;
	subtype?: string;

	unpinGif?: (gifKey: string) => void;
	unpinImage?: (gifKey: string) => void;
	unpinText?: (textKey: string) => void;
	unpinObjkt?: (objktKey: string) => void;
	pinBackground?: (imgSrc: string) => void;
	unpinBackground?: () => void;
}

export const BoardObject = (props: BoardObjectProps) => {
	const {
		top,
		left,
		data,
		onPin,
		onUnpin,
		isPinnedPlaying,
		isPinned,
		type,
		imgSrc,
		text,
		id,
		order,
		addNewContract,
		onBuy,
		onCancel,
		chat,
		horseData,
		playlist,
		setActivePanel,
		raceId,
		objktId,
		activeAddress,
		routeRoom,
		subtype,
		unpinGif,
		unpinImage,
		unpinText,
		unpinObjkt,
		pinBackground,
		unpinBackground
	} = props;
	const location = useLocation();
	const [isHovering, setIsHovering] = useState(false);
	const [objkt, setobjkt] = useState();
	const [sells, setSells] = useState(0);
	const [revenue, setRevenue] = useState(0);

	const [sellSound] = useState(new Audio("https://www.mboxdrive.com/success.mp3"));
	const [forSale, setForSale] = useState(0);
	const [sId, setSId] = useState(0);
	const [sPrice, setSPrice] = useState(0);

	const classes = useStyles();

	const { socket } = useContext(AppStateContext);

	let leftRoom, rightRoom, topRoom, bottomRoom;
	let x, y;
	const [, drop] = useDrop({
		accept: 'item',
		drop(item: IPinnedItem, monitor) {
			const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
			if(type === "trash"){
				switch (item.itemType){
					case "image": 
						unpinImage(item.id);
					break;
					case "gif": 
						unpinGif(item.id);
					break;
					case "objkt": 
						unpinObjkt(item.id);
					break;
					case "text": 
						unpinText(item.id);
					break;
					case "bgHolder": 
						unpinBackground();
					break;
				}
				return undefined;
			}
			else if(type === "bgHolder"){
				if(item.itemType === "image"){
					pinBackground(item.imgSrc);
					unpinImage(item.id);
				}
				else if(item.itemType === "gif"){
					pinBackground("https://i.giphy.com/media/" + item.data.id + "/giphy.webp");
					unpinGif(item.id);
				}
			}

		}
	});
	if(location.pathname.length != 1){
		x = parseInt(location.pathname.split("/")[2].split(",")[0]);
		y = parseInt(location.pathname.split("/")[2].split(",")[1]);
	}
	else{
		x = 0;
		y = 0;
	}
	leftRoom = (x-1)+ "," + y;
	rightRoom= (x+1) + "," + y;
	topRoom = x + "," + (y+1);
	bottomRoom = x + "," + (y-1);


	async function fetchObjkt(id) {

		const { errors, data } = await fetchGraphQL(query_objkt, 'objkt', {
			id: id
		})
		if (errors) {
			//console.error(errors)
		}
		if(data){
			const result = data.hic_et_nunc_token_by_pk
			console.log(result)

			return result
		}

	}

	async function fetchGraphQL(operationsDoc, operationName, variables) {
		let result = await fetch('https://hdapi.teztools.io/v1/graphql', {
			method: 'POST',
			body: JSON.stringify({
				query: operationsDoc,
				variables: variables,
				operationName: operationName,
			}),
		})

		var ress = await result.json();
		return ress;
	}

	async function collect( swapId, amount ) {

        return await Tezos.wallet
        .at(v2)
        .then((c) =>
          c.methods
            .collect(parseFloat(swapId))
            .send({
              amount: parseFloat(amount),
              mutez: true,
              storageLimit: 350,
            })
        )
        .catch((e) => e)
      }

	useEffect(() => {
		if (type === 'objktHistory' || type === "objkt") {

			async function fetchMyAPI() {

				let temp = await fetchObjkt(objktId);
				let tempForSale = 0;
				if(temp){				
					temp.trades.reverse();
					setobjkt(temp);

                    let swaps = temp.swaps.filter(e => parseInt(e.contract_version) === 2 && parseInt(e.status) === 0 && e.is_valid)
                    let s = _.minBy(swaps, (o) => Number(o.price))

                    if(s){
                        setSId(s.id);
                        setSPrice(s.price);
                    }


                    setobjkt(temp);
                    for (let i = 0; i < temp.swaps.length; i++) {
                        if(temp.swaps[i].status === 0){
                            tempForSale = tempForSale + temp.swaps[i].amount_left;
                        }
                    }
                    setForSale(tempForSale);
                    
					if(type === 'objktHistory' ){
						let sellCount = 0;
						let objktRevenue = 0;

						for (let i = 0; i < temp.trades.length; i++) {
							sellCount = sellCount + 1;
							objktRevenue = objktRevenue + temp.trades[i].swap.price;
						}

						setSells(sellCount);
						setRevenue(objktRevenue / 1000000);
					}
					
				}

			}
			fetchMyAPI()
		}
	}, [])

	useEffect(() => {
		if (type === 'objktHistory' || type === "objkt") {

			async function fetchMyAPI() {

				let temp = await fetchObjkt(objktId);
				let tempForSale = 0;
				if(temp){				
					temp.trades.reverse();
					setobjkt(temp);

                    let swaps = temp.swaps.filter(e => parseInt(e.contract_version) === 2 && parseInt(e.status) === 0 && e.is_valid)
                    let s = _.minBy(swaps, (o) => Number(o.price))

                    if(s){
                        setSId(s.id);
                        setSPrice(s.price);
                    }


                    setobjkt(temp);
                    for (let i = 0; i < temp.swaps.length; i++) {
                        if(temp.swaps[i].status === 0){
                            tempForSale = tempForSale + temp.swaps[i].amount_left;
                        }
                    }
                    setForSale(tempForSale);
                    
					if(type === 'objktHistory' ){
						let sellCount = 0;
						let objktRevenue = 0;

						for (let i = 0; i < temp.trades.length; i++) {
							sellCount = sellCount + 1;
							objktRevenue = objktRevenue + temp.trades[i].swap.price;
						}

						setSells(sellCount);
						setRevenue(objktRevenue / 1000000);
					}
					
				}

			}
			fetchMyAPI()
		}

	}, [])

	useEffect(() => {
		if (type === 'objktHistory' || type === "objkt") {
			const interval = setInterval(async () => {
				let sellCount = 0;

				let temp = await fetchObjkt(objktId);
				if(temp && temp.trades)
					temp.trades.reverse();
				if (objkt) {
					for (let i = 0; i < objkt!.trades.length; i++) {
						sellCount = sellCount + 1;
					}
					if ((sellCount !== sells && sells != 0)) {
						activateFireworks();
						sellSound.play();
						setobjkt(temp);
					}

					if ((objkt.token_holders.length !== temp.token_holders.length)) {
						activateFireworks();
						setobjkt(temp);
						sellSound.play();
					}
				}

			}, 60000);
			return () => clearInterval(interval);
		}
	}, [objkt, sells, sellSound])


	const [{ isDragging }, drag, preview] = useDrag({
		item: { id, left, top, itemType: type, type: 'item', imgSrc, data },
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	});

	/*if (isDragging) {
		return <div ref={preview} />;
	}*/

	const noLinkPrev = (
		<div className={classes.text} style={{ width: 180 }}>
			{text}
		</div>
	);

	const shouldShowMoveButton =
		isPinned || type === 'chat' || type === 'musicPlayer';

	return (
		<div
			style={{
				top,
				left,
				/* zIndex: isHovering ? 99999999 : 'auto' */
				zIndex: (isHovering || type === 'chat') ? 99999999 : 99999998
			}}
			className={classes.container}
			ref={drag}
		>
			<Paper
				elevation={0}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				onTouchStart={() => setIsHovering(true)}
				onTouchEnd={() => setIsHovering(false)}
			>
				{type === 'gif' && data && <Gif gif={data}  width={180} noLink={true} />}
				{type === 'image' && imgSrc && (
					
						<img alt="user-selected-img" src={imgSrc} style={{ width: 180, height: '100%' }} />
					
				)}
				{type === 'text' && text && (
					<div className={classes.text} style={{ width: 200 , border: '1px dashed black'}}>
						<div>
							{text && (
								<LinkPreview
									url={text!}
									fallback={noLinkPrev}
									descriptionLength={50}
									imageHeight={100}
									showLoader={false}
								/>
							)}
						</div>
					</div>
				)}
				{type === 'NFT' && order && (
					<Order
						onBuy={() => (onBuy ? onBuy(id) : undefined)}
						onCancel={() => (onCancel ? onCancel(id) : undefined)}
						addNewContract={addNewContract}
						order={order}
					/>
				)}
				{type === 'map' && data && <Map />}
				{type === 'tweet' && id && <Tweet tweetId={id} />}
				{type === 'video' && id && (
					<div
						className="pinned-video-player"
						style={{
							height: '225px',
							width: '400px'
						}}
					>
						<ReactPlayer
							width="100%"
							height="100%"
							url={`https://www.youtube.com/watch/${id}`}
							controls={true}
							playing={isPinnedPlaying}
							onPlay={() => {
								socket.emit('event', {
									key: 'youtube',
									value: id,
									playPin: true
								});
							}}
							onPause={() => {
								socket.emit('event', {
									key: 'youtube',
									value: id,
									playPin: false
								});
							}}
						/>
					</div>
				)}
				{type === 'horse' && horseData && <Horse horse={horseData} />}
				{type === 'chat' && chat && setActivePanel && (
					<WaterfallChat
						setActivePanel={setActivePanel}
						chat={chat}
					/>
				)}
				{type === 'musicPlayer' && playlist && setActivePanel &&
					<div style={{ width: 320 }} onClick={(e) => { e.stopPropagation(); setActivePanel('music'); }} >
						<MusicPlayer playlist={playlist} />
					</div>
				}
				{type === 'race' && (
					<div style={{ width: 400, height: 225 }}>
						<iframe
							src={`https://3d-racing.zed.run/live/${raceId}`}
							width="100%"
							height="100%"
							title="zed racing"
							style={{ pointerEvents: 'auto' }}
						/>
					</div>
				)}
				{type === 'objkt' && (
					<div style={{ width: 340,  backgroundColor: "white" , border: '1px dashed black'}}>
                        {objkt && <div style={{display:"flex", alignItems: "center", paddingInline:6}} > 
							<div style={{color: "black", textAlign: "left"}}> {forSale}  / {objkt.supply}  </div>
							<div style={{ color: "black", textAlign: "center", fontSize: 20, margin:"auto" }} ><Button className={classes.button}  title={objkt.title} onClick={() => { window.open('https://www.hicetnunc.xyz/objkt/' + objkt.id); }}>{objkt.title}</Button></div>
							<div style={{color: "black", textAlign: "right"}}>{ Number(sPrice / 1000000)} tez</div>
						</div>}
						{ objkt && objkt.mime === "video/mp4" && 
							<video  width="100%" title={"Shell Sort"} autoPlay={true} muted controls controlsList="nodownload" loop  >
								<source src={HashToURL( objkt.artifact_uri, 'IPFS')} type="video/mp4" />
							</video>}
						{ objkt && (objkt.mime === "image/jpeg" || objkt.mime === "image/gif") &&
							<img src={HashToURL( objkt.artifact_uri, 'IPFS')} alt={objkt.title} width="340"  height="100%" ></img>
						}


                        <div style={{ color: "white", pointerEvents: "auto", textAlign: "center" }}>
                            {sId != 0 && <Button className={classes.buttonBuy} title={"buy"} onClick={() => { collect(sId, sPrice) }}>BUY</Button>}
                            {sId === 0 && <Button className={classes.buttonBuy} title={"buy"} onClick={() => { collect(sId, sPrice) }}>Not Available</Button>}

                        </div>
					</div>
				)}
				{type === 'objktHistory' && (
					<div style={{ width: 680, height: 500, backgroundColor: "white", overflowY: 'auto', border: '1px dashed black' }}>

						{objkt && <div  >
                            <div style={{display:"flex", alignItems: "center", paddingInline:6}} > 
                            <div style={{color: "black", textAlign: "left"}}> {forSale}  / {objkt.supply}  </div>
							<div style={{ color: "black", textAlign: "center", fontSize: 30, margin:"auto" }} ><Button className={classes.buttonLarge}  title={objkt.title} onClick={() => { window.open('https://www.hicetnunc.xyz/objkt/' + objkt.id); }}>{objkt.title}</Button></div>
							<div style={{color: "black", textAlign: "right"}}>{ Number(sPrice / 1000000)} tez</div>
                            </div>
							{ objkt.mime === "video/mp4" && 
								<video style={{ paddingLeft: 175 }} width="50%" title={"Shell Sort"} autoPlay={true} muted controls controlsList="nodownload" loop  >
									<source src={HashToURL( objkt.artifact_uri, 'IPFS')} type="video/mp4" />
								</video>}
							{ (objkt.mime === "image/jpeg" || objkt.mime === "image/gif") &&
								<img src={HashToURL( objkt.artifact_uri, 'IPFS')} style={{ paddingLeft: 175 }} alt={objkt.title} width="340" ></img>
							}


							{
								<div style={{ color: "white", pointerEvents: "auto", textAlign: "center" }}>
									<div>Total Sell Count: {sells}</div>
									<div>Total Revenue: {revenue}</div>
									<div>Token Holders: {objkt.token_holders.length}</div>
                                    {sId != 0 && <Button className={classes.buttonBuy} title={"buy"} onClick={() => { collect(sId, sPrice) }}>BUY</Button>}
                                    {sId === 0 && <Button className={classes.buttonBuy} title={"buy"} onClick={() => { collect(sId, sPrice) }}>Not Available</Button>}
                                    <br></br>
									{objkt.trades.map((trade) => (
										<>
											{(activeAddress && (trade.seller.address === activeAddress || trade.buyer.address === activeAddress)) ?
												<div style={{ paddingLeft: 20, textAlign: "left", color: "green" }}>
													trade {trade.timestamp.slice(0, 10)} from {trade.seller.name ? <Button className={classes.button} title={"seller"} onClick={() => { window.open('https://www.hicetnunc.xyz/' + trade.seller.name); }}>{trade.seller.name}</Button> : <Button className={classes.button} title={"seller"} onClick={() => { window.open('https://www.hicetnunc.xyz/tz/' + trade.seller.address); }}>{trade.seller.address.slice(0, 6)} ... {trade.seller.address.slice(32, 36)}</Button>} {trade.amount} ed. {trade.swap.price / 1000000} tez {trade.buyer.name ? <Button className={classes.button} title={"buyer"} onClick={() => { window.open('https://www.hicetnunc.xyz/' + trade.buyer.name); }}>{trade.buyer.name}</Button> : <Button className={classes.button} title={"buyer"} onClick={() => { window.open('https://www.hicetnunc.xyz/tz/' + trade.buyer.address); }}>{trade.buyer.address.slice(0, 6)} ... {trade.buyer.address.slice(32, 36)}</Button>}
												</div>
												:
												<div style={{ paddingLeft: 20, textAlign: "left", color: "white" }}>
													trade {trade.timestamp.slice(0, 10)} from {trade.seller.name ? <Button className={classes.button} title={"seller"} onClick={() => { window.open('https://www.hicetnunc.xyz/' + trade.seller.name); }}>{trade.seller.name}</Button> : <Button className={classes.button} title={"seller"} onClick={() => { window.open('https://www.hicetnunc.xyz/tz/' + trade.seller.address); }}>{trade.seller.address.slice(0, 6)} ... {trade.seller.address.slice(32, 36)}</Button>} {trade.amount} ed. {trade.swap.price / 1000000} tez {trade.buyer.name ? <Button className={classes.button} title={"buyer"} onClick={() => { window.open('https://www.hicetnunc.xyz/' + trade.buyer.name); }}>{trade.buyer.name}</Button> : <Button className={classes.button} title={"buyer"} onClick={() => { window.open('https://www.hicetnunc.xyz/tz/' + trade.buyer.address); }}>{trade.buyer.address.slice(0, 6)} ... {trade.buyer.address.slice(32, 36)}</Button>}
												</div>}</>
									))}
									minted {objkt.timestamp} {objkt.supply} ed. {objkt.royalties / 10}% royalties
								</div>

							}
						</div>}
					</div>
				)}
				{type === 'gate' && subtype === 'top' && y != 2 &&(
<					Button className={classes.buttonGate} onClick={() => { routeRoom(topRoom) }}>^</Button>
				)}
				{type === 'gate' && subtype === 'left' && x != -2 &&(
<					Button className={classes.buttonGate} onClick={() => { routeRoom(leftRoom) }}>{"<"}</Button>
				)}
				{type === 'gate' && subtype === 'bottom' && y != -2 &&(
<					Button className={classes.buttonGateBottom} onClick={() => { routeRoom(bottomRoom) }}>^</Button>
				)}
				{type === 'gate' && subtype === 'right' && x != 2 &&(
<					Button className={classes.buttonGate} onClick={() => { routeRoom(rightRoom) }}>{">"}</Button>
				)}
				{type === 'trash' && <div ref={drop} style = {{ border: '3px dashed black', width:100, height: 30, backgroundColor: "white", color: "black", textAlign: "center", fontSize: 20}}> Trash </div>}
				{type === 'bgHolder' && <div ref={drop} style = {{ border: '3px dashed black', width:180, height: 30, backgroundColor: "white", color: "black", textAlign: "center", fontSize: 20}}> Background </div>}
			
			</Paper>

			
		</div>
	);
};

const activateFireworks = () => {
	let duration = 2 * 1000;
	let animationEnd = Date.now() + duration;
	let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

	let interval: NodeJS.Timeout = setInterval(function () {
		let timeLeft = animationEnd - Date.now();

		if (timeLeft <= 0) {
			return clearInterval(interval);
		}

		let particleCount = 50 * (timeLeft / duration);
		// since particles fall down, start a bit higher than random
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
			})
		);
		fireworkSound.play();
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
			})
		);
	}, 250);
};

const query_objkt = `
query objkt($id: bigint!) {
  hic_et_nunc_token_by_pk(id: $id) {
id
mime
timestamp
display_uri
description
artifact_uri
metadata
creator {
  address
  name
}
thumbnail_uri
title
supply
royalties
swaps {
  amount
  amount_left
  id
  price
  timestamp
  creator {
    address
    name
  }
  contract_version
  status
  royalties
  creator_id
  is_valid
}
token_holders(where: {quantity: {_gt: "0"}}) {
  holder_id
  quantity
  holder {
    name
  }
}
token_tags {
  tag {
    tag
  }
}
trades(order_by: {timestamp: asc}) {
  amount
  swap {
    price
  }
  seller {
    address
    name
  }
  buyer {
    address
    name
  }
  timestamp
}
}
}
`
const fireworkSound = new Audio("https://www.fesliyanstudios.com/play-mp3/6963");

function randomInRange(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

// converts an ipfs hash to ipfs url
const HashToURL = (hash, type) => {
	// when on preview the hash might be undefined.
	// its safe to return empty string as whatever called HashToURL is not going to be used
	// artifactUri or displayUri
	if (hash == undefined) {
	  return ''
	}
  
	switch (type) {
	  case 'HIC':
		return hash.replace('ipfs://', 'https://pinata.hicetnunc.xyz/ipfs/')
	  case 'CLOUDFLARE':
		return hash.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')
	  case 'PINATA':
		return hash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
	  case 'IPFS':
		return hash.replace('ipfs://', 'https://ipfs.io/ipfs/')
	  case 'INFURA':
		try {
		var cidv1 = new ipfsClient.CID(hash.replace('ipfs://', '')).toV1()
		var subdomain = cidv1.toBaseEncodedString('base32')
		return `https://${subdomain}.ipfs.infura-ipfs.io/`
	  } catch (err) {
		return undefined
	  }
	  case 'DWEB':
		return hash.replace('ipfs://', 'http://dweb.link/ipfs/')
	  default:
		console.error('please specify type')
		return hash
	}
  }