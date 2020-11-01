import React, {useState, useEffect} from 'react';

import PropTypes, { number } from 'prop-types';

import { Container } from '../../styles/globalStyles';

import { get } from 'lodash';

import { Form, ProfilePicture, Title }  from './styled';

import { toast } from 'react-toastify';

import { isEmail, isInt, isFloat } from 'validator';

import {useDispatch} from 'react-redux';

import {FaEdit, FaUserCircle} from 'react-icons/fa';

import { Link } from 'react-router-dom';

import Loading from '../../components/loading';
import axios from '../../services/axios';
import history from '../../services/history';

import * as actions from '../../store/modules/auth/actions';

export default function Aluno({match}) {

  const dispatch = useDispatch();

  const id = get(match, 'params.id', '');

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [foto, setFoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function getData(){
      try{
        setIsLoading(true);

        const {data} = await axios.get(`/alunos/${id}`);

        const Foto = get(data, 'Fotos[0].url', '');

        setFoto(foto);

        setNome(data.nome);

        setSobrenome(data.sobrenome);

        setEmail(data.email);

        setIdade(data.idade);

        setPeso(data.peso);

        setAltura(data.altura);

        setIsLoading(false);

      }catch(err){
        setIsLoading(false);
        const status = get(err, 'response.status', 0);
        const errors = get(err, 'response.data.errors', []);

        if(status === 400) errors.map(error => toast.error(error));
        history.push('/');
      }
    }
    getData();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();

    let formsErrors = false;

    if(nome.length < 3 || nome.length > 50) {
      formsErrors = true;
      toast.error('Nome precisa ter entre 3 e 50 caracteres');
    }

    if(sobrenome.length < 3 || nome.length > 50){
      formsErrors = true;
      toast.error('Nome precisa ter entre 3 e 50 caracteres');
    }

    if (!isEmail(email)){
      formsErrors = true;
      toast.error('Email inválido')
    }

    if(!isInt(String(idade))){
      formsErrors = true;
      toast.error('Idade deve ser um número inteiro');
    }

    if(!isFloat(String(peso))){
      formsErrors = true;
      toast.error('Peso deve ser numero inteiro ou de ponto flutuante');
    }

    if(!isFloat(String(altura))){
      formsErrors = true;
      toast.error('Altura deve ser numero inteiro ou de ponto flutuante');
    }

    if(formsErrors) return

    try{
      setIsLoading(true);
      if(id){
        //editando
        await axios.put(`/alunos/${id}`, {
          nome,
          sobrenome,
          email,
          idade,
          peso,
          altura,
        });
        toast.success('Aluno(a) editado(a) com sucesso!');
      } else {
        const {data} = await axios.post(`/alunos/`, {
          nome,
          sobrenome,
          email,
          idade,
          peso,
          altura,
      });
      toast.success('Aluno(a) criado(a) com sucesso!');
      history.push(`/aluno/${data.id}/edit`);
    }

    setIsLoading(false);

  } catch(err){
    //criando
    const status = get(err, 'response.status', 0);
    const data = get(err, 'response.data', {});
    const errors = get(data, 'errors', []);

    if(errors.length > 0) {
      errors.map(error => toast.error(error));
    } else {
      toast.error('Erro desconhecido');
    }

    if(status === 401) dispatch(actions.loginFailure());

  }
}

  return (
      <Container>
        <Loading isLoading={isLoading} />

        <Title>{id ? 'Editar aluno' : 'Novo Aluno'}</Title>

        {id && (
          <ProfilePicture>
            {foto ? (
              <img src={foto} alt={nome} />
            ) : (
              <FaUserCircle size={180} />
            )}
            <Link to={`/fotos/${id}`}>
              <FaEdit size={24} />
            </Link>
          </ProfilePicture>
        )}

        <Form onSubmit={handleSubmit}>
          <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Nome" />

          <input
          type="text"
          value={sobrenome}
          onChange={e => setSobrenome(e.target.value)}
          placeholder="Sobrenome" />

          <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email" />

          <input
          type="number"
          value={idade}
          onChange={e => setIdade(e.target.value)}
          placeholder="Idade" />

          <input
          type="text"
          value={peso}
          onChange={e => setPeso(e.target.value)}
          placeholder="Peso" />

          <input
          type="text"
          value={altura}
          onChange={e => setAltura(e.target.value)}
          placeholder="Altura" />

          <button type="submit">Enviar</button>
        </Form>
      </Container>
  );
}

Aluno.propTypes = {
  match: PropTypes.shape({}).isRequired,
};
