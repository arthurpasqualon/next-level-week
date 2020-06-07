import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import logo from '../../assets/logo.svg'
import { Link, useHistory } from 'react-router-dom' // navigate easily between screens
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker} from 'react-leaflet'
import api from '../../services/api';
import axios from 'axios';

import './styles.css';
import { LeafletMouseEvent } from 'leaflet';


interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUFResponse {
	[uf: string]: any;
	sigla: string
}

interface IBGECityResponse {
	[x: string]: any;
	nome: string;
};

const CreatePoint = () => {

	const [items, setItems] = useState<Item[]>([]); // Array de Item
	const [ufs, setUfs] = useState<string[]>([])
	const [selectedUf, setSelectedUf] = useState('0');
	const [cities, setCities] = useState<string[]>([]);
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])
	const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: '',
	})
	const history = useHistory()

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		})
	},[])

	useEffect(() => {
		axios.get<IBGEUFResponse>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map((uf: { sigla: any; }) => uf.sigla)
			setUfs(ufInitials);
		})
	},[])

	useEffect(() => {
		if(selectedUf === '0'){
			return;
		}
		axios.get<IBGECityResponse>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cityNames = response.data.map((city: { nome: any; }) => city.nome)
			setCities(cityNames);
		})
	},[selectedUf])

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords
			setInitialPosition([latitude, longitude]);
		});
	},[])


	function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUf(uf);
	}

	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}

	function handleSelectItem(id: number) { 
		const alreadySelected = selectedItems.findIndex(item => item === id)
		if (alreadySelected >= 0){
			const filteredItems = selectedItems.filter(item => item !== id)
			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([...selectedItems, id])
		}
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>){
		const { name, value } = event.target
		setFormData({ ...formData, [name]: value})
	} 

	function handleMapClick(event: LeafletMouseEvent) {

		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng,
		])
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;

		const data = {
			name,
			email,
			whatsapp,
			uf,
			city,
			latitude,
			longitude,
			items
		}
		await api.post('/points', data)
		alert('Ponto de Alerta criado!!');

		history.push('/')
	}
  
	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta"/>
				<Link to='/'>
					<FiArrowLeft/>
					Voltar para a home
				</Link>
			</header>
			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br /> ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>
				</fieldset>
				<div className="field">
					<label htmlFor="name" id="name">Nome da entidade</label>
					<input type="text" onChange={handleInputChange} name="name" id="name"/>
				</div>
				<div className="field-group">
					<div className="field">
						<label htmlFor="email">E-mail</label>
						<input onChange={handleInputChange} type="email" name="email" id="email"/>
					</div>
					<div className="field">
						<label htmlFor="whatspapp">WhatsApp</label>
						<input onChange={handleInputChange} type="text" name="whatspapp" id="whatspapp"/>
					</div>
				</div>
				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={15} onclick={handleMapClick}>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
						/>
						<Marker position={selectedPosition}/>
					</Map>
				</fieldset>
				<div className="field-group">
					<div className="field">
						<label htmlFor="uf">Estado</label>
						<select name="uf"  id="uf" value={selectedUf} onChange={handleSelectUF}>
							<option value="0">Selecione uma UF</option>
							{ufs.length > 0 && ufs.map(uf => {
								return (
								<option value={uf}>{uf}</option>
								)
							})
							}
						</select>
					</div>
					<div className="field">
						<label htmlFor="city">Cidade</label>
						<select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
							<option value="0">Selecione uma Cidade</option>
							{cities.length > 0 && cities.map(city => {
								return (
								<option value={city}>{city}</option>
								)
							})
							}
						</select>
					</div>
				</div>
				<fieldset>
					<legend>
						<h2>Itens de Coleta</h2>
						<span>Selecione um ou mais items abaixo</span>
					</legend>
				</fieldset>
				<ul className="items-grid">
					{items.length > 0 && items.map( item => {
						return (
						<li 
							key={item.id}
							onClick={() => handleSelectItem(item.id)}
							className={selectedItems.includes(item.id) ? 'selected' : ''}
							>
							<img src={item.image_url} alt="teste"/>
							<span>{item.title}</span>
						</li>
						)
					})

					}
				</ul>
				<button type="submit">
					Cadastrar ponto de coleta
				</button>
			</form>
		</div>
	);
  
}

export default CreatePoint