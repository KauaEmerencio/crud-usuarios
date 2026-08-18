package com.kaua.backend.service;

import com.kaua.backend.dto.UsuarioRequestDTO;
import com.kaua.backend.exception.RecursoNaoEncontradoException;
import com.kaua.backend.exception.RegraNegocioException;
import com.kaua.backend.model.Usuario;
import com.kaua.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuário não encontrado com o ID: " + id));
    }

    @Transactional
    public Usuario criar(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByCpf(dto.getCpf())) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com este CPF");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com este e-mail");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setCpf(dto.getCpf());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());
        usuario.setDataNascimento(dto.getDataNascimento());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = buscarPorId(id);

        if (usuarioRepository.existsByCpfAndIdNot(dto.getCpf(), id)) {
            throw new RegraNegocioException("Já existe outro usuário cadastrado com este CPF");
        }
        if (usuarioRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new RegraNegocioException("Já existe outro usuário cadastrado com este e-mail");
        }

        usuario.setNome(dto.getNome());
        usuario.setCpf(dto.getCpf());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());
        usuario.setDataNascimento(dto.getDataNascimento());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        Usuario usuario = buscarPorId(id);
        usuarioRepository.delete(usuario);
    }
}