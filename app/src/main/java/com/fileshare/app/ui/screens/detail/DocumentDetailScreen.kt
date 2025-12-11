package com.fileshare.app.ui.screens.detail

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.fileshare.app.domain.model.Document
import com.fileshare.app.ui.components.ZoomableImageDialog
import com.fileshare.app.util.FileUtils
import com.fileshare.app.viewmodel.CategoryViewModel
import com.fileshare.app.viewmodel.DocumentViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun DocumentDetailScreen(
    documentId: Long,
    documentViewModel: DocumentViewModel,
    categoryViewModel: CategoryViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (Long) -> Unit
) {
    val document by documentViewModel.getDocumentById(documentId).collectAsState(initial = null)
    val categories by categoryViewModel.categories.collectAsState()
    val context = LocalContext.current
    var showDeleteDialog by remember { mutableStateOf(false) }
    val dateFormatter = remember { SimpleDateFormat("yyyy.MM.dd HH:mm", Locale.getDefault()) }

    document?.let { doc ->
        val category = categories.find { it.id == doc.categoryId }
        val pagerState = rememberPagerState(pageCount = { doc.imageUris.size })
        var showImageDialog by remember { mutableStateOf(false) }
        var selectedImageIndex by remember { mutableStateOf(0) }
        
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("문서 상세") },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(Icons.Default.ArrowBack, "뒤로")
                        }
                    },
                    actions = {
                        IconButton(onClick = { onNavigateToEdit(documentId) }) {
                            Icon(Icons.Default.Edit, "수정")
                        }
                        IconButton(onClick = { showDeleteDialog = true }) {
                            Icon(Icons.Default.Delete, "삭제")
                        }
                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
            ) {
                // Image Pager
                if (doc.imageUris.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)) // 배경색 추가
                    ) {
                        HorizontalPager(
                            state = pagerState,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(400.dp) // 높이 고정
                        ) { page ->
                            val fileUri = doc.imageUris[page]
                            val isPdf = fileUri.endsWith(".pdf", ignoreCase = true)
                            
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                if (FileUtils.fileExists(fileUri)) {
                                    if (isPdf) {
                                        // PDF Icon
                                        Column(
                                            modifier = Modifier
                                                .clickable { FileUtils.openFile(context, fileUri) }
                                                .padding(16.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.spacedBy(16.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.PictureAsPdf,
                                                contentDescription = "PDF",
                                                modifier = Modifier.size(80.dp),
                                                tint = MaterialTheme.colorScheme.error
                                            )
                                            Text(
                                                "PDF 문서 열기",
                                                style = MaterialTheme.typography.titleMedium,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    } else {
                                        // Image
                                        AsyncImage(
                                            model = java.io.File(fileUri),
                                            contentDescription = "${doc.title} - 이미지 ${page + 1}",
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .clickable {
                                                    selectedImageIndex = page
                                                    showImageDialog = true
                                                },
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                } else {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.BrokenImage,
                                            contentDescription = null,
                                            modifier = Modifier.size(64.dp),
                                            tint = MaterialTheme.colorScheme.outline
                                        )
                                        Text("이미지를 찾을 수 없습니다", style = MaterialTheme.typography.bodyMedium)
                                    }
                                }
                            }
                        }
                        
                        // Page indicator
                        if (doc.imageUris.size > 1) {
                            Surface(
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(16.dp),
                                color = MaterialTheme.colorScheme.inverseSurface.copy(alpha = 0.6f),
                                shape = MaterialTheme.shapes.extraLarge, // 둥근 캡슐 모양
                                contentColor = MaterialTheme.colorScheme.inverseOnSurface
                            ) {
                                Text(
                                    text = "${pagerState.currentPage + 1} / ${doc.imageUris.size}",
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                    style = MaterialTheme.typography.labelLarge
                                )
                            }
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(250.dp)
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ImageNotSupported,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                            )
                            Text(
                                "첨부된 이미지가 없습니다",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Document Info
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp), // 패딩 증가
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    // Header Section (Title & Category)
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                color = MaterialTheme.colorScheme.secondaryContainer,
                                shape = MaterialTheme.shapes.small
                            ) {
                                Text(
                                    text = category?.name ?: "미분류",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                            Spacer(Modifier.weight(1f))
                            Text(
                                text = dateFormatter.format(Date(doc.createdAt)),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        
                        Text(
                            text = doc.title,
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                    // Memo Section
                    if (!doc.memo.isNullOrBlank()) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "메모",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Surface(
                                color = MaterialTheme.colorScheme.surface,
                                shape = MaterialTheme.shapes.medium,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant, MaterialTheme.shapes.medium)
                            ) {
                                Text(
                                    text = doc.memo,
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(16.dp)
                                )
                            }
                        }
                    }

                    // Metadata
                    Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f), MaterialTheme.shapes.medium)
                            .padding(16.dp)
                    ) {
                        MetadataRow("이미지", "${doc.imageUris.size}개")
                        MetadataRow("최근 수정", dateFormatter.format(Date(doc.updatedAt)))
                        if (doc.shareCount > 0) {
                            MetadataRow("공유 횟수", "${doc.shareCount}회")
                        }
                    }

                    Spacer(Modifier.height(8.dp))

                    // Share Button
                    Button(
                        onClick = {
                            if (doc.imageUris.isNotEmpty()) {
                                FileUtils.shareMultipleFiles(context, doc.imageUris)
                                documentViewModel.incrementShareCount(documentId)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = doc.imageUris.isNotEmpty(),
                        shape = MaterialTheme.shapes.large,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                    ) {
                        Icon(Icons.Default.Share, null, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Text("파일 공유하기", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        // Delete Confirmation Dialog
        if (showDeleteDialog) {
            AlertDialog(
                onDismissRequest = { showDeleteDialog = false },
                icon = { Icon(Icons.Default.DeleteForever, null, tint = MaterialTheme.colorScheme.error) },
                title = { Text("문서 삭제") },
                text = { Text("정말 이 문서를 삭제하시겠습니까?\n삭제된 문서는 복구할 수 없습니다.", textAlign = androidx.compose.ui.text.style.TextAlign.Center) },
                confirmButton = {
                    Button(
                        onClick = {
                            documentViewModel.deleteDocument(doc)
                            showDeleteDialog = false
                            onNavigateBack()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("삭제")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showDeleteDialog = false }) {
                        Text("취소")
                    }
                }
            )
        }
        
        // Zoomable Image Dialog
        if (showImageDialog && doc.imageUris.isNotEmpty()) {
            val imageUri = doc.imageUris[selectedImageIndex]
            if (FileUtils.fileExists(imageUri)) {
                ZoomableImageDialog(
                    imageData = java.io.File(imageUri),
                    onDismiss = { showImageDialog = false }
                )
            }
        }
    } ?: run {
        // Loading or not found
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }
}

@Composable
fun MetadataRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}
